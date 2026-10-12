import QRCode from "qrcode"
import { parseAbiItem, type Address, type Hash } from "viem"
import { moedaAbi } from "../../shared/src/generated/moeda"
import { WALLET_URL } from "../../shared/src/links"
import { $, errorText, short, show, toast } from "../../shared/src/lib/dom"
import { decodeAddress, walletLink } from "../../shared/src/lib/pay-uri"
import { listedCoins, REGISTRY_ADDRESS, type ListedCoin } from "../../shared/src/lib/registry"
import { formatAmount, tokenBalance } from "../../shared/src/lib/tokens"
import { chain, explorerTx, publicClient, walletFor } from "../../shared/src/lib/wallet"
import { isAndroid, rawbtLink } from "./receipt"

const NAME_KEY = "moeda/terminal/name"
const SALES_KEY = "moeda/terminal/sales"
const MAX_BEERS = 20
/** The Hub RPC can report a block before its logs are queryable, so every poll looks back over the whole sale instead of only new blocks. */
const LOG_WINDOW = 300n

const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)")

interface Sale {
  token: Address
  symbol: string
  decimals: number
  beers: number
  amount: string
  from: Address
  hash: Hash
  block: string
  at: number
}

const wallet = walletFor("terminal")
const merchant = wallet.account.address

let beers = 1
let coins: ListedCoin[] = []
let stopWatching: (() => void) | null = null
let lastSale: Sale | null = null

function sales(): Sale[] {
  try {
    const stored: Partial<Sale>[] = JSON.parse(localStorage.getItem(SALES_KEY) ?? "[]")
    return stored.filter((sale): sale is Sale => Boolean(sale.token && sale.beers))
  } catch {
    return []
  }
}

function recordSale(sale: Sale) {
  localStorage.setItem(SALES_KEY, JSON.stringify([sale, ...sales()].slice(0, 200)))
}

function shopName() {
  return localStorage.getItem(NAME_KEY) || "terminal"
}

function beersLabel(count: number) {
  return count === 1 ? "1 cerveja" : `${count} cervejas`
}

function readShopFromUrl() {
  const name = new URLSearchParams(location.search).get("loja")
  if (!name) return
  localStorage.setItem(NAME_KEY, name)
  history.replaceState(null, "", location.pathname)
}

function showBeers() {
  beers = 1
  renderBeers()
  show("beers")
}

function renderBeers() {
  $("#beers").textContent = String(beers)
  ;($("#beers-less") as HTMLButtonElement).disabled = beers <= 1
  ;($("#beers-more") as HTMLButtonElement).disabled = beers >= MAX_BEERS
  $("#beers-quick")
    .querySelectorAll("button")
    .forEach((button) => button.setAttribute("aria-pressed", String(Number(button.textContent) === beers)))
}

$("#beers-less").addEventListener("click", () => {
  beers = Math.max(1, beers - 1)
  renderBeers()
})

$("#beers-more").addEventListener("click", () => {
  beers = Math.min(MAX_BEERS, beers + 1)
  renderBeers()
})

$("#beers-quick").addEventListener("click", (event) => {
  const count = Number((event.target as HTMLElement).closest("button")?.textContent)
  if (!count) return
  beers = count
  renderBeers()
})

$("#choose-coin").addEventListener("click", () => void showCoins())
$("#coins-back").addEventListener("click", () => show("beers"))

async function showCoins() {
  $("#coins-beers").textContent = beersLabel(beers)
  renderCoins()
  show("coins")
  if (!coins.length) $("#coins-status").textContent = "A ler as moedas do registo…"
  try {
    coins = await listedCoins()
    $("#coins-status").textContent = coins.length ? "" : "Ainda não há moedas no registo."
    renderCoins()
  } catch (error) {
    $("#coins-status").textContent = `Sem ligação ao registo: ${errorText(error).slice(0, 80)}`
  }
}

function renderCoins() {
  $("#coin-list").replaceChildren(
    ...coins.map((coin) => {
      const button = document.createElement("button")
      button.type = "button"
      const cell = (className: string, text: string) => {
        const span = document.createElement("span")
        span.className = className
        span.textContent = text
        return span
      }
      button.append(
        cell("symbol", coin.symbol),
        cell("total", formatAmount(coin.beerPrice * BigInt(beers), coin.decimals)),
        cell("name", coin.name),
        cell("each", `${formatAmount(coin.beerPrice, coin.decimals)} por cerveja`),
      )
      button.addEventListener("click", () => void charge(coin))
      return button
    }),
  )
}

/**
 * Adds a tag of at most a millionth of a coin, so two sales of the same price never match the same transfer.
 */
function saleTag(decimals: number) {
  const range = 10n ** BigInt(Math.max(0, decimals - 6))
  return BigInt(crypto.getRandomValues(new Uint32Array(1))[0]) % range
}

async function charge(coin: ListedCoin) {
  const count = beers
  const amount = coin.beerPrice * BigInt(count) + saleTag(coin.decimals)
  const uri = walletLink(WALLET_URL, { token: coin.address, to: merchant, amount, chainId: chain.id })
  $("#charge-beers").textContent = beersLabel(count)
  $("#charge-amount").textContent = `${formatAmount(amount, coin.decimals)} ${coin.symbol}`
  $("#charge-status").textContent = "À espera do pagamento…"
  const canvas = document.createElement("canvas")
  $("#charge-qr").replaceChildren(canvas)
  await QRCode.toCanvas(canvas, uri, { margin: 0, width: 600, errorCorrectionLevel: "M" })
  show("charge")
  stopWatching = watchForPayment(coin.address, amount, (payment) => {
    stopWatching = null
    const sale: Sale = { ...payment, token: coin.address, symbol: coin.symbol, decimals: coin.decimals, beers: count, amount: amount.toString() }
    recordSale(sale)
    void showPaid(sale)
  })
}

function watchForPayment(token: Address, amount: bigint, onPaid: (payment: Pick<Sale, "from" | "hash" | "block" | "at">) => void) {
  let active = true
  let firstBlock: bigint | null = null

  const poll = async () => {
    if (!active) return
    try {
      const latest = await publicClient.getBlockNumber({ cacheTime: 0 })
      if (firstBlock === null) firstBlock = latest > 2n ? latest - 2n : 0n
      const fromBlock = latest - firstBlock > LOG_WINDOW ? latest - LOG_WINDOW : firstBlock
      const logs = await publicClient.getLogs({ address: token, event: transferEvent, fromBlock, toBlock: latest })
      const match = logs.find((log) => log.args.to?.toLowerCase() === merchant.toLowerCase() && log.args.value === amount)
      if (match && active) {
        active = false
        onPaid({ from: match.args.from!, hash: match.transactionHash!, block: match.blockNumber!.toString(), at: Date.now() })
        return
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

function saleTotal(sale: Sale) {
  return `${formatAmount(BigInt(sale.amount), sale.decimals)} ${sale.symbol}`
}

async function showPaid(sale: Sale) {
  lastSale = sale
  $("#paid-beers").textContent = String(sale.beers)
  $("#paid-amount").textContent = saleTotal(sale)
  $("#paid-from").textContent = short(sale.from)
  $("#paid-block").textContent = `#${sale.block}`
  const receiptUrl = explorerTx(sale.hash)
  const canvas = document.createElement("canvas")
  $("#paid-qr").replaceChildren(canvas)
  await QRCode.toCanvas(canvas, receiptUrl, { margin: 0, width: 400 })
  $("#receipt-shop").textContent = shopName()
  $("#receipt-date").textContent = new Date(sale.at).toLocaleString("pt-PT")
  $("#receipt-items").textContent = `${sale.beers} x cerveja`
  $("#receipt-amount").textContent = `Total: ${saleTotal(sale)}`
  $("#receipt-from").textContent = `De: ${sale.from}`
  $("#receipt-tx").textContent = `Tx: ${sale.hash}`
  ;($("#receipt-qr") as HTMLImageElement).src = await QRCode.toDataURL(receiptUrl, { margin: 0, width: 300 })
  navigator.vibrate?.([80, 60, 160])
  show("paid")
}

$("#charge-cancel").addEventListener("click", () => {
  stopWatching?.()
  stopWatching = null
  show("coins")
})

$("#new-sale").addEventListener("click", showBeers)

$("#print").addEventListener("click", () => {
  if (!lastSale) return
  if (!isAndroid()) {
    window.print()
    return
  }
  const link = document.createElement("a")
  link.href = rawbtLink({
    shop: shopName(),
    date: new Date(lastSale.at).toLocaleString("pt-PT"),
    items: `${lastSale.beers} x cerveja`,
    total: saleTotal(lastSale),
    from: lastSale.from,
    tx: lastSale.hash,
    link: explorerTx(lastSale.hash),
  })
  link.target = "_blank"
  link.rel = "noopener"
  link.click()
})

function totalsBySymbol(list: Sale[]) {
  const totals = new Map<string, { value: bigint; decimals: number }>()
  for (const sale of list) {
    const total = totals.get(sale.symbol) ?? { value: 0n, decimals: sale.decimals }
    total.value += BigInt(sale.amount)
    totals.set(sale.symbol, total)
  }
  return [...totals].map(([symbol, total]) => `${formatAmount(total.value, total.decimals)} ${symbol}`).join(" · ")
}

$("#open-history").addEventListener("click", () => void openHistory())
$("#history-back").addEventListener("click", showBeers)

async function openHistory() {
  const list = sales()
  const today = list.filter((sale) => new Date(sale.at).toDateString() === new Date().toDateString())
  $("#history-total").textContent = totalsBySymbol(today) || "0"
  $("#history-beers").textContent = String(today.reduce((sum, sale) => sum + sale.beers, 0))
  $("#history-balance").textContent = "…"
  $("#history-list").replaceChildren(
    ...list.map((sale) => {
      const row = document.createElement("a")
      row.className = "item"
      row.href = explorerTx(sale.hash)
      row.target = "_blank"
      row.rel = "noopener"
      row.style.color = "inherit"
      row.style.textDecoration = "none"
      const when = document.createElement("span")
      when.textContent = `${new Date(sale.at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} · ${beersLabel(sale.beers)}`
      const total = document.createElement("span")
      total.className = "green"
      total.textContent = saleTotal(sale)
      row.append(when, total)
      return row
    }),
  )
  show("history")
  try {
    if (!coins.length) coins = await listedCoins()
    const balances = await Promise.all(coins.map(async (coin) => ({ coin, balance: await tokenBalance(coin.address, merchant) })))
    $("#history-balance").textContent =
      balances.map(({ coin, balance }) => `${formatAmount(balance, coin.decimals)} ${coin.symbol}`).join(" · ") || "0"
  } catch {
    $("#history-balance").textContent = "sem ligação"
  }
}

$("#open-settings").addEventListener("click", () => {
  stopWatching?.()
  stopWatching = null
  ;($("#settings-name") as HTMLInputElement).value = localStorage.getItem(NAME_KEY) ?? ""
  $("#settings-address").textContent = merchant
  $("#settings-registry").textContent = REGISTRY_ADDRESS
  $("#settings-coins").textContent =
    coins.map((coin) => `${coin.symbol} ${formatAmount(coin.beerPrice, coin.decimals)}`).join(" · ") || "…"
  show("settings")
})

$("#settings-name").addEventListener("change", (event) => {
  const name = (event.target as HTMLInputElement).value.trim()
  if (name) localStorage.setItem(NAME_KEY, name)
  else localStorage.removeItem(NAME_KEY)
  $("#shop-name").textContent = shopName()
})

$("#settings-back").addEventListener("click", showBeers)

$("#withdraw").addEventListener("click", async () => {
  const to = decodeAddress(($("#withdraw-to") as HTMLInputElement).value)
  if (!to) return toast("Endereço inválido")
  try {
    if (!coins.length) coins = await listedCoins()
    let sent = 0
    for (const coin of coins) {
      const balance = await tokenBalance(coin.address, merchant)
      if (balance === 0n) continue
      const hash = await wallet.writeContract({ address: coin.address, abi: moedaAbi, functionName: "transfer", args: [to, balance] })
      toast(`${coin.symbol} enviado, à espera da rede…`)
      await publicClient.waitForTransactionReceipt({ hash })
      sent++
    }
    toast(sent ? "Saldo levantado" : "Sem saldo para levantar")
  } catch (error) {
    toast(errorText(error))
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

readShopFromUrl()
$("#shop-name").textContent = shopName()
showBeers()
void keepScreenOn()
void listedCoins()
  .then((listed) => (coins = listed))
  .catch(() => undefined)
