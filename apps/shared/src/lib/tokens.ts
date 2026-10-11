import { formatUnits, getAddress, parseUnits, type Address } from "viem"
import { moedaAbi } from "../generated/moeda"
import { publicClient } from "./wallet"

export interface TokenInfo {
  address: Address
  name: string
  symbol: string
  decimals: number
  feeBps: bigint
  treasury: Address | null
}

const cache = new Map<string, Promise<TokenInfo>>()

export function readToken(address: Address): Promise<TokenInfo> {
  const key = address.toLowerCase()
  let pending = cache.get(key)
  if (!pending) {
    pending = (async () => {
      const read = <T>(functionName: string) =>
        publicClient.readContract({ address, abi: moedaAbi, functionName: functionName as never }) as Promise<T>
      const [name, symbol, decimals] = await Promise.all([read<string>("name"), read<string>("symbol"), read<number>("decimals")])
      const [feeBps, treasury] = await Promise.all([
        read<bigint>("feeBps").catch(() => 0n),
        read<Address>("treasury").catch(() => null),
      ])
      return { address: getAddress(address), name, symbol, decimals: Number(decimals), feeBps, treasury }
    })()
    pending.catch(() => cache.delete(key))
    cache.set(key, pending)
  }
  return pending
}

export function tokenBalance(token: Address, owner: Address) {
  return publicClient.readContract({ address: token, abi: moedaAbi, functionName: "balanceOf", args: [owner] })
}

export function feeFor(token: TokenInfo, amount: bigint, payer?: Address) {
  if (payer && token.treasury?.toLowerCase() === payer.toLowerCase()) return 0n
  return (amount * token.feeBps + 9_999n) / 10_000n
}

export function formatAmount(value: bigint, decimals: number, maxFraction = 2) {
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".")
  let shown = fraction.slice(0, maxFraction).replace(/0+$/, "")
  if (shown && shown.length < 2) shown = shown.padEnd(2, "0")
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return shown ? `${grouped},${shown}` : grouped
}

export function parseAmount(text: string, decimals: number) {
  return parseUnits(text.replace(/\s/g, "").replace(",", "."), decimals)
}

const LIST_KEY = "moeda/tokens"

export function savedTokens(): Address[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LIST_KEY) ?? "[]")
    return Array.isArray(raw) ? raw.map((a) => getAddress(a)) : []
  } catch {
    return []
  }
}

export function rememberToken(address: Address) {
  const list = savedTokens()
  if (!list.some((a) => a.toLowerCase() === address.toLowerCase())) {
    localStorage.setItem(LIST_KEY, JSON.stringify([...list, getAddress(address)]))
  }
}

export function forgetToken(address: Address) {
  localStorage.setItem(LIST_KEY, JSON.stringify(savedTokens().filter((a) => a.toLowerCase() !== address.toLowerCase())))
}
