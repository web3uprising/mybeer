import { getAddress, isAddress, type Address } from "viem"

export interface PaymentRequest {
  token: Address
  to: Address
  amount: bigint
  chainId: number
}

export function encodePaymentRequest({ token, to, amount, chainId }: PaymentRequest): string {
  return `ethereum:${token}@${chainId}/transfer?address=${to}&uint256=${amount}`
}

const PATTERN = /^ethereum:(0x[0-9a-fA-F]{40})@(\d+)\/transfer\?(.+)$/

export function walletLink(origin: string, request: PaymentRequest): string {
  return `${origin}/?ecra=carteira#pay=${encodeURIComponent(encodePaymentRequest(request))}`
}

export function decodePaymentRequest(uri: string): PaymentRequest | null {
  const wrapped = /#pay=([^&]+)/.exec(uri)
  const raw = wrapped ? decodeURIComponent(wrapped[1]) : uri
  const match = PATTERN.exec(raw.trim())
  if (!match) return null
  const params = new URLSearchParams(match[3])
  const to = params.get("address")
  const amount = params.get("uint256")
  if (!to || !isAddress(to) || !amount || !/^\d+$/.test(amount)) return null
  return {
    token: getAddress(match[1]),
    chainId: Number(match[2]),
    to: getAddress(to),
    amount: BigInt(amount),
  }
}

export function decodeAddress(text: string): Address | null {
  const raw = text.trim().replace(/^ethereum:/, "").split(/[@?/]/)[0]
  return isAddress(raw) ? getAddress(raw) : null
}
