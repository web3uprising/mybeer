import QRCode from "qrcode"
import { TERMINAL_URL } from "../../shared/src/links"
import { isHex, parseEther, parseUnits, type Address, type Hash } from "viem"
import { moedaAbi, moedaBytecode } from "../../shared/src/generated/moeda"
import { $, errorText, short, show, toast } from "../../shared/src/lib/dom"
import { decodeAddress, decodePaymentRequest, type PaymentRequest } from "../../shared/src/lib/pay-uri"
import { startScanner, type Scanner } from "../../shared/src/lib/scanner"
import {
  feeFor,
  forgetToken,
  formatAmount,
  parseAmount,
  readToken,
  rememberToken,
  savedTokens,
  tokenBalance,
  type TokenInfo,
} from "../../shared/src/lib/tokens"
import { chain, explorerTx, loadOrCreateKey, publicClient, replaceKey, walletFor } from "../../shared/src/lib/wallet"

const SCOPE = "carteira"
let wallet = walletFor(SCOPE)
let me = wallet.account.address

let scanner: Scanner | null = null
let scanTarget: "pay" | "send" = "pay"
let pendingRequest: { request: PaymentRequest; token: TokenInfo } | null = null
let openToken: TokenInfo | null = null

function ingestUrlToken() {
  const param = new URLSearchParams(location.search).get("token")
  const address = param ? decodeAddress(param) : null
  if (address) {
    rememberToken(address)
    history.replaceState(null, "", location.pathname)
  }
}

async function pasBalance() {
  return publicClient.getBalance({ address: me })
}

async function renderHome() {
  $("#me-short").textContent = short(me)
  show("home")
  const list = $("#tokens")
  const pasRow = tokenRow("PAS", "rede · paga as taxas", "…")
  list.replaceChildren(pasRow.el)
  pasBalance()
    .then((b) => (pasRow.balance.textContent = formatAmount(b, 18, 3)))
    .catch(() => (pasRow.balance.textContent = "sem rede"))

  for (const address of savedTokens()) {
    const row = tokenRow("…", short(address), "…")
    row.el.setAttribute("role", "button")
    row.el.tabIndex = 0
    list.append(row.el)
    readToken(address)
      .then(async (info) => {
        row.symbol.textContent = info.symbol
        row.name.textContent = info.name
        row.el.addEventListener("click", () => void openTokenPage(info))
        row.balance.textContent = formatAmount(await tokenBalance(address, me), info.decimals)
      })
      .catch(() => (row.balance.textContent = "erro"))
  }
}

function tokenRow(symbol: string, name: string, balance: string) {
  const el = document.createElement("div")
  el.className = "token"
  el.innerHTML = `<div class="stack" style="gap:2px"><span class="sym"></span><span class="muted"></span></div><span class="bal"></span>`
  const [symbolEl, nameEl] = el.querySelectorAll("span")
  const balanceEl = el.querySelector<HTMLElement>(".bal")!
  symbolEl.textContent = symbol
  nameEl.textContent = name
  balanceEl.textContent = balance
  return { el, symbol: symbolEl as HTMLElement, name: nameEl as HTMLElement, balance: balanceEl }
}

async function openScanner(target: "pay" | "send") {
  scanTarget = target
  $("#scan-error").textContent = ""
  show("scan")
  try {
    scanner = await startScanner($("#scan-video") as HTMLVideoElement, (text) => {
      scanner = null
      void handleScan(text)
    })
  } catch (error) {
    $("#scan-error").textContent = `Não consegui abrir a câmara: ${errorText(error)}`
  }
}

function closeScanner() {
  scanner?.stop()
  scanner = null
}

async function handleScan(text: string) {
  const request = decodePaymentRequest(text)
  if (request) {
    if (request.chainId !== chain.id) {
      toast("Esse pagamento é de outra rede")
      return renderHome()
    }
    return prepareConfirm(request)
  }
  if (/[?&]token=0x/i.test(text)) {
    const address = decodeAddress(text.replace(/^.*[?&]token=/, ""))
    if (address) {
      rememberToken(address)
      toast("Moeda adicionada")
      return renderHome()
    }
  }
  const address = decodeAddress(text)
  if (address) {
    if (scanTarget === "send") {
      ;($("#send-to") as HTMLInputElement).value = address
      return show("send")
    }
    ;($("#send-to") as HTMLInputElement).value = address
    await fillAssetSelect()
    return show("send")
  }
  toast("Não percebi esse código")
  renderHome()
}

async function prepareConfirm(request: PaymentRequest) {
  try {
    const token = await readToken(request.token)
    rememberToken(token.address)
    pendingRequest = { request, token }
    const fee = feeFor(token, request.amount, me)
    const [balance, gas] = await Promise.all([tokenBalance(token.address, me), pasBalance()])
    $("#confirm-to").textContent = short(request.to)
    $("#confirm-amount").textContent = `${formatAmount(request.amount, token.decimals)} ${token.symbol}`
    $("#confirm-fee").textContent = fee === 0n ? "sem taxa" : `+ ${formatAmount(fee, token.decimals, 4)} ${token.symbol}`
    $("#confirm-balance").textContent = `${formatAmount(balance, token.decimals)} ${token.symbol}`
    const go = $("#confirm-go") as HTMLButtonElement
    let problem = ""
    if (balance < request.amount + fee) problem = `Não tens ${token.symbol} suficientes.`
    else if (gas === 0n) problem = "Precisas de um pouco de PAS para pagar a rede. Pede ao organizador (botão Receber)."
    $("#confirm-error").textContent = problem
    go.disabled = problem !== ""
    show("confirm")
  } catch (error) {
    toast(`Moeda desconhecida: ${errorText(error)}`)
    renderHome()
  }
}

async function runTx(label: string, to: Address, send: () => Promise<Hash>) {
  show("pending")
  $("#pending-status").textContent = "A assinar…"
  try {
    const hash = await send()
    $("#pending-status").textContent = "À espera do bloco…"
    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 })
    if (receipt.status !== "success") throw new Error("A transação falhou na cadeia")
    $("#done-amount").textContent = label
    $("#done-to").textContent = short(to)
    ;($("#done-link") as HTMLAnchorElement).href = explorerTx(hash)
    navigator.vibrate?.(120)
    show("done")
    return receipt
  } catch (error) {
    toast(errorText(error))
    await renderHome()
    return null
  }
}

$("#confirm-go").addEventListener("click", () => {
  if (!pendingRequest) return
  const { request, token } = pendingRequest
  pendingRequest = null
  void runTx(`${formatAmount(request.amount, token.decimals)} ${token.symbol}`, request.to, () =>
    wallet.writeContract({ address: token.address, abi: moedaAbi, functionName: "transfer", args: [request.to, request.amount] }),
  )
})

$("#confirm-cancel").addEventListener("click", () => {
  pendingRequest = null
  void renderHome()
})

async function fillAssetSelect() {
  const select = $("#send-asset") as HTMLSelectElement
  const options = [new Option("PAS (rede)", "PAS")]
  for (const address of savedTokens()) {
    try {
      const info = await readToken(address)
      options.push(new Option(`${info.symbol} · ${info.name}`, address))
    } catch {
      continue
    }
  }
  const previous = select.value
  select.replaceChildren(...options)
  if (options.some((o) => o.value === previous)) select.value = previous
}

$("#send-go").addEventListener("click", async () => {
  const asset = ($("#send-asset") as HTMLSelectElement).value
  const to = decodeAddress(($("#send-to") as HTMLInputElement).value)
  const amountText = ($("#send-amount") as HTMLInputElement).value.trim()
  const error = $("#send-error")
  if (!to) return void (error.textContent = "Endereço inválido.")
  if (!amountText) return void (error.textContent = "Escreve quanto queres enviar.")
  error.textContent = ""
  try {
    if (asset === "PAS") {
      const value = parseEther(amountText.replace(",", "."))
      await runTx(`${amountText} PAS`, to, () => wallet.sendTransaction({ to, value }))
    } else {
      const info = await readToken(asset as Address)
      const value = parseAmount(amountText, info.decimals)
      await runTx(`${amountText} ${info.symbol}`, to, () =>
        wallet.writeContract({ address: info.address, abi: moedaAbi, functionName: "transfer", args: [to, value] }),
      )
    }
  } catch (e) {
    error.textContent = errorText(e)
  }
})

function percentToBps(text: string, max: number) {
  const value = Number(text.replace(",", "."))
  if (!Number.isFinite(value) || value < 0 || value > max) throw new Error(`Valor fora do intervalo 0 a ${max}%`)
  return BigInt(Math.round(value * 100))
}

$("#create-go").addEventListener("click", async () => {
  const value = (id: string) => ($(id) as HTMLInputElement).value.trim()
  const error = $("#create-error")
  try {
    const name = value("#create-name")
    const symbol = value("#create-symbol").toUpperCase()
    if (!name || !symbol) throw new Error("Dá um nome e um símbolo à moeda.")
    const supply = parseUnits(value("#create-supply").replace(/\s/g, "") || "0", 18)
    const max = parseUnits(value("#create-max").replace(/\s/g, "") || "0", 18)
    if (max !== 0n && supply > max) throw new Error("A quantidade inicial passa o máximo.")
    const inflation = percentToBps(value("#create-inflation") || "0", 100)
    const fee = percentToBps(value("#create-fee") || "0", 10)
    if ((await pasBalance()) === 0n) throw new Error("Precisas de PAS para lançar. Pede ao organizador (botão Receber).")
    error.textContent = ""
    show("pending")
    $("#pending-status").textContent = "A lançar a moeda…"
    const hash = await wallet.deployContract({
      abi: moedaAbi,
      bytecode: moedaBytecode,
      args: [name, symbol, supply, max, inflation, fee],
    })
    $("#pending-status").textContent = "À espera do bloco…"
    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 })
    if (receipt.status !== "success" || !receipt.contractAddress) throw new Error("O lançamento falhou na cadeia")
    rememberToken(receipt.contractAddress)
    toast(`${symbol} lançada`)
    await openTokenPage(await readToken(receipt.contractAddress))
  } catch (e) {
    error.textContent = errorText(e)
    show("create")
  }
})

async function openTokenPage(info: TokenInfo) {
  openToken = info
  $("#token-title").innerHTML = ""
  $("#token-title").append(info.name, Object.assign(document.createElement("u"), { textContent: ` ${info.symbol}` }))
  $("#token-address").textContent = info.address
  $("#token-fee").textContent = `${Number(info.feeBps) / 100}%`
  for (const id of ["#token-balance", "#token-supply", "#token-pending"]) $(id).textContent = "…"
  const shareUrl = `${TERMINAL_URL}/?token=${info.address}`
  const qr = $("#token-qr")
  qr.replaceChildren()
  const canvas = document.createElement("canvas")
  qr.append(canvas)
  await QRCode.toCanvas(canvas, shareUrl, { margin: 0, width: 400 })
  show("token")
  const read = <T>(functionName: string) =>
    publicClient.readContract({ address: info.address, abi: moedaAbi, functionName: functionName as never }) as Promise<T>
  const [balance, supply, pending, owner] = await Promise.all([
    tokenBalance(info.address, me),
    read<bigint>("totalSupply"),
    read<bigint>("pendingInflation").catch(() => 0n),
    read<Address>("owner").catch(() => null),
  ])
  $("#token-balance").textContent = `${formatAmount(balance, info.decimals)} ${info.symbol}`
  $("#token-supply").textContent = formatAmount(supply, info.decimals)
  $("#token-pending").textContent = formatAmount(pending, info.decimals, 4)
  ;($("#token-mint") as HTMLButtonElement).hidden = owner?.toLowerCase() !== me.toLowerCase()
}

$("#token-mint").addEventListener("click", () => {
  if (!openToken) return
  const info = openToken
  void runTx(`inflação de ${info.symbol}`, info.address, () =>
    wallet.writeContract({ address: info.address, abi: moedaAbi, functionName: "mintInflation" }),
  )
})

$("#token-forget").addEventListener("click", () => {
  if (openToken) forgetToken(openToken.address)
  void renderHome()
})

$("#go-pay").addEventListener("click", () => void openScanner("pay"))
$("#scan-cancel").addEventListener("click", () => {
  closeScanner()
  void renderHome()
})

$("#go-receive").addEventListener("click", async () => {
  $("#receive-address").textContent = me
  const qr = $("#receive-qr")
  qr.replaceChildren()
  const canvas = document.createElement("canvas")
  qr.append(canvas)
  await QRCode.toCanvas(canvas, me, { margin: 0, width: 500 })
  show("receive")
})

$("#receive-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(me)
    toast("Copiado")
  } catch {
    toast(me)
  }
})

$("#go-send").addEventListener("click", async () => {
  await fillAssetSelect()
  $("#send-error").textContent = ""
  show("send")
})
$("#send-scan").addEventListener("click", () => void openScanner("send"))
$("#go-create").addEventListener("click", () => show("create"))

for (const id of ["#receive-back", "#send-back", "#create-back", "#token-back", "#backup-back", "#done-home"]) {
  $(id).addEventListener("click", () => void renderHome())
}

$("#go-backup").addEventListener("click", () => {
  $("#backup-key").hidden = true
  show("backup")
})

$("#backup-reveal").addEventListener("click", () => {
  const card = $("#backup-key")
  card.querySelector("span")!.textContent = loadOrCreateKey(SCOPE)
  card.hidden = false
})

$("#backup-import-go").addEventListener("click", () => {
  const key = ($("#backup-import") as HTMLInputElement).value.trim()
  if (!isHex(key) || key.length !== 66) return toast("Chave inválida")
  try {
    replaceKey(SCOPE, key)
    wallet = walletFor(SCOPE)
    me = wallet.account.address
    toast("Carteira trocada")
    void renderHome()
  } catch (error) {
    toast(errorText(error))
  }
})

$("#add-token-go").addEventListener("click", async () => {
  const address = decodeAddress(($("#add-token") as HTMLInputElement).value)
  if (!address) return toast("Endereço inválido")
  try {
    const info = await readToken(address)
    rememberToken(info.address)
    toast(`${info.symbol} adicionada`)
    void renderHome()
  } catch (error) {
    toast(`Não é uma moeda: ${errorText(error)}`)
  }
})

function pendingPayLink() {
  const request = decodePaymentRequest(location.hash)
  if (request) history.replaceState(null, "", location.pathname)
  return request
}

$("#me-short").textContent = short(me)
ingestUrlToken()
const linked = pendingPayLink()
if (linked) void prepareConfirm(linked)
else void renderHome()

window.addEventListener("hashchange", () => {
  const request = pendingPayLink()
  if (request) void prepareConfirm(request)
})
