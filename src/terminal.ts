import QRCode from "qrcode"
import { publicOrigin } from "./lib/origin"
import { getAddress, isAddress, parseAbiItem, type Address, type Hash } from "viem"
import { moedaAbi } from "./generated/moeda"
import { $, errorText, short, show, toast } from "./lib/dom"
import { decodeAddress, walletLink } from "./lib/pay-uri"
import { startScanner, type Scanner } from "./lib/scanner"
import { formatAmount, parseAmount, readToken, tokenBalance, type TokenInfo } from "./lib/tokens"
import { chain, explorerTx, publicClient, walletFor } from "./lib/wallet"

const TOKEN_KEY = "moeda/terminal/token"
const NAME_KEY = "moeda/terminal/name"
const SALES_KEY = "moeda/terminal/sales"

const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)")

interface Sale {
  amount: string
  from: Address
  hash: Hash
  block: string
  at: number
}

const wallet = walletFor("terminal")
const merchant = wallet.account.address

let token: TokenInfo | null = null
let typed = ""
let stopWatching: (() => void) | null = null
let setupScanner: Scanner | null = null
let lastSale: Sale | null = null

function sales(): Sale[] {
  try {
    return JSON.parse(localStorage.getItem(SALES_KEY) ?? "[]")
  } catch {
    return []
  }
}

function recordSale(sale: Sale) {
  localStorage.setItem(SALES_KEY, JSON.stringify([sale, ...sales()].slice(0, 200)))
}

function configuredToken(): Address | null {
  const fromUrl = new URLSearchParams(location.search).get("token")
  if (fromUrl && isAddress(fromUrl)) {
    localStorage.setItem(TOKEN_KEY, getAddress(fromUrl))
    const name = new URLSearchParams(location.search).get("loja")
    if (name) localStorage.setItem(NAME_KEY, name)
    history.replaceState(null, "", `${location.pathname}?ecra=terminal`)
  }
  const stored = localStorage.getItem(TOKEN_KEY)
  return stored && isAddress(stored) ? getAddress(stored) : null
}

async function boot() {
  $("#shop-name").textContent = localStorage.getItem(NAME_KEY) || "terminal"
  const address = configuredToken()
  if (!address) {
    show("setup")
    return
  }
  try {
    token = await readToken(address)
    $("#token-symbol").textContent = token.symbol
    showKeypad()
  } catch (error) {
    $("#setup-error").textContent = `Não encontrei a moeda ${short(address)}: ${errorText(error)}`
    ;($("#setup-token") as HTMLInputElement).value = address
    show("setup")
  }
}

function showKeypad() {
  typed = ""
  renderAmount()
  show("keypad")
}

function typedValue(): bigint {
  if (!token || !typed || typed === ",") return 0n
  try {
    return parseAmount(typed, token.decimals)
  } catch {
    return 0n
  }
}

function renderAmount() {
  $("#amount").textContent = typed || "0"
  ;($("#charge") as HTMLButtonElement).disabled = typedValue() === 0n
}

$("#keypad").addEventListener("click", (event) => {
  const key = (event.target as HTMLElement).closest("button")?.textContent
  if (!key) return
  if (key === "⌫") typed = typed.slice(0, -1)
  else if (key === ",") {
    if (!typed.includes(",")) typed = (typed || "0") + ","
  } else {
    const [, fraction] = typed.split(",")
    if (fraction !== undefined && fraction.length >= 2) return
    if (typed.replace(",", "").length >= 9) return
    typed = typed === "0" ? key : typed + key
  }
  renderAmount()
})

$("#charge").addEventListener("click", () => void charge())

async function charge() {
  if (!token) return
  const price = typedValue()
  if (price === 0n) return
  const saleTag = BigInt((crypto.getRandomValues(new Uint32Array(1))[0] % 999_999) + 1)
  const amount = price + saleTag
  const uri = walletLink(publicOrigin(), { token: token.address, to: merchant, amount, chainId: chain.id })
  $("#charge-amount").textContent = `${formatAmount(amount, token.decimals)} ${token.symbol}`
  $("#charge-status").textContent = "À espera do pagamento…"
  const qr = $("#charge-qr")
  qr.replaceChildren()
  const canvas = document.createElement("canvas")
  qr.append(canvas)
  await QRCode.toCanvas(canvas, uri, { margin: 0, width: 600, errorCorrectionLevel: "M" })
  show("charge")
  stopWatching = watchForPayment(token, amount, (sale) => {
    stopWatching = null
    recordSale(sale)
    void showPaid(sale)
  })
}

function watchForPayment(info: TokenInfo, amount: bigint, onPaid: (sale: Sale) => void) {
  let active = true
  let fromBlock: bigint | null = null

  const poll = async () => {
    if (!active) return
    try {
      const latest = await publicClient.getBlockNumber({ cacheTime: 0 })
      if (fromBlock === null) fromBlock = latest > 2n ? latest - 2n : 0n
      if (latest >= fromBlock) {
        const logs = await publicClient.getLogs({
          address: info.address,
          event: transferEvent,
          fromBlock,
          toBlock: latest,
        })
        const match = logs.find((log) => log.args.to?.toLowerCase() === merchant.toLowerCase() && log.args.value === amount)
        if (match && active) {
          active = false
          onPaid({
            amount: amount.toString(),
            from: match.args.from!,
            hash: match.transactionHash!,
            block: match.blockNumber!.toString(),
            at: Date.now(),
          })
          return
        }
        fromBlock = latest + 1n
      }
      $("#charge-status").textContent = "À espera do pagamento…"
    } catch (error) {
      $("#charge-status").textContent = `Sem ligação à rede, a tentar de novo (${errorText(error).slice(0, 60)})`
    }
    if (active) setTimeout(poll, 2_000)
  }
  void poll()
  return () => {
    active = false
  }
}

async function showPaid(sale: Sale) {
  if (!token) return
  lastSale = sale
  const label = `${formatAmount(BigInt(sale.amount), token.decimals)} ${token.symbol}`
  $("#paid-amount").textContent = label
  $("#paid-from").textContent = short(sale.from)
  $("#paid-block").textContent = `#${sale.block}`
  const receiptUrl = explorerTx(sale.hash)
  const qr = $("#paid-qr")
  qr.replaceChildren()
  const canvas = document.createElement("canvas")
  qr.append(canvas)
  await QRCode.toCanvas(canvas, receiptUrl, { margin: 0, width: 400 })
  $("#receipt-shop").textContent = localStorage.getItem(NAME_KEY) || "Terminal Moeda"
  $("#receipt-date").textContent = new Date(sale.at).toLocaleString("pt-PT")
  $("#receipt-amount").textContent = `Total: ${label}`
  $("#receipt-from").textContent = `De: ${sale.from}`
  $("#receipt-tx").textContent = `Tx: ${sale.hash}`
  ;($("#receipt-qr") as HTMLImageElement).src = await QRCode.toDataURL(receiptUrl, { margin: 0, width: 300 })
  navigator.vibrate?.([80, 60, 160])
  show("paid")
}

$("#charge-cancel").addEventListener("click", () => {
  stopWatching?.()
  stopWatching = null
  showKeypad()
})

$("#new-sale").addEventListener("click", showKeypad)
$("#print").addEventListener("click", () => {
  if (lastSale) window.print()
})

$("#open-history").addEventListener("click", () => void openHistory())
$("#history-back").addEventListener("click", showKeypad)

async function openHistory() {
  if (!token) return
  const info = token
  const list = sales()
  const today = new Date().toDateString()
  const total = list.filter((s) => new Date(s.at).toDateString() === today).reduce((sum, s) => sum + BigInt(s.amount), 0n)
  $("#history-total").textContent = `${formatAmount(total, info.decimals)} ${info.symbol}`
  $("#history-balance").textContent = "…"
  $("#history-list").replaceChildren(
    ...list.map((s) => {
      const row = document.createElement("a")
      row.className = "item"
      row.href = explorerTx(s.hash)
      row.target = "_blank"
      row.rel = "noopener"
      row.style.color = "inherit"
      row.style.textDecoration = "none"
      row.innerHTML = `<span>${new Date(s.at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} · ${short(s.from)}</span><span class="green">${formatAmount(BigInt(s.amount), info.decimals)}</span>`
      return row
    }),
  )
  show("history")
  tokenBalance(info.address, merchant)
    .then((b) => ($("#history-balance").textContent = `${formatAmount(b, info.decimals)} ${info.symbol}`))
    .catch(() => ($("#history-balance").textContent = "sem ligação"))
}

$("#open-settings").addEventListener("click", () => {
  stopWatching?.()
  stopWatching = null
  $("#settings-address").textContent = merchant
  $("#settings-token").textContent = token ? `${token.symbol} · ${token.address}` : "nenhuma"
  show("settings")
})

$("#settings-back").addEventListener("click", () => (token ? showKeypad() : show("setup")))

$("#settings-reset").addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY)
  token = null
  ;($("#setup-token") as HTMLInputElement).value = ""
  show("setup")
})

$("#withdraw").addEventListener("click", async () => {
  if (!token) return
  const to = decodeAddress(($("#withdraw-to") as HTMLInputElement).value)
  if (!to) return toast("Endereço inválido")
  try {
    const balance = await tokenBalance(token.address, merchant)
    if (balance === 0n) return toast("Sem saldo para levantar")
    const hash = await wallet.writeContract({ address: token.address, abi: moedaAbi, functionName: "transfer", args: [to, balance] })
    toast("Enviado, à espera da rede…")
    await publicClient.waitForTransactionReceipt({ hash })
    toast("Saldo levantado")
  } catch (error) {
    toast(errorText(error))
  }
})

$("#setup-save").addEventListener("click", async () => {
  const input = ($("#setup-token") as HTMLInputElement).value
  const address = decodeAddress(input)
  if (!address) {
    $("#setup-error").textContent = "Isso não parece um endereço 0x…"
    return
  }
  const name = ($("#setup-name") as HTMLInputElement).value.trim()
  if (name) localStorage.setItem(NAME_KEY, name)
  localStorage.setItem(TOKEN_KEY, address)
  $("#setup-error").textContent = "A ler a moeda…"
  await boot()
})

$("#setup-scan").addEventListener("click", async () => {
  const box = $("#setup-scanner")
  if (setupScanner) {
    setupScanner.stop()
    setupScanner = null
    box.hidden = true
    return
  }
  box.hidden = false
  try {
    setupScanner = await startScanner(box.querySelector("video")!, (text) => {
      setupScanner = null
      box.hidden = true
      const address = decodeAddress(text.replace(/^.*[?&]token=/, ""))
      if (address) ($("#setup-token") as HTMLInputElement).value = address
      else $("#setup-error").textContent = "Esse QR não tem uma moeda"
    })
  } catch (error) {
    box.hidden = true
    $("#setup-error").textContent = `Sem câmara: ${errorText(error)}`
  }
})

async function keepScreenOn() {
  try {
    await navigator.wakeLock?.request("screen")
  } catch {
    return
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") void keepScreenOn()
})

void keepScreenOn()
void boot()
