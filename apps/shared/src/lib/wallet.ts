import { createPublicClient, createWalletClient, http, type Hex } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { polkadotHubTestnet } from "../chain"

export const chain = polkadotHubTestnet

export const publicClient = createPublicClient({ chain, transport: http(), pollingInterval: 2_000 })

function storageKey(scope: string) {
  return `moeda/${scope}/privateKey`
}

export function loadOrCreateKey(scope: string): Hex {
  const existing = localStorage.getItem(storageKey(scope))
  if (existing && /^0x[0-9a-fA-F]{64}$/.test(existing)) return existing as Hex
  const key = generatePrivateKey()
  localStorage.setItem(storageKey(scope), key)
  return key
}

export function replaceKey(scope: string, key: Hex) {
  privateKeyToAccount(key)
  localStorage.setItem(storageKey(scope), key)
}

export function walletFor(scope: string) {
  const account = privateKeyToAccount(loadOrCreateKey(scope))
  return createWalletClient({ account, chain, transport: http() })
}

export function explorerTx(hash: string) {
  return `${chain.blockExplorers.default.url}/tx/${hash}`
}

export function explorerAddress(address: string) {
  return `${chain.blockExplorers.default.url}/address/${address}`
}
