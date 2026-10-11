import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"
import { polkadotHubTestnet } from "../src/chain"

export const publicClient = createPublicClient({ chain: polkadotHubTestnet, transport: http() })

export function loadKey(name: string) {
  const path = `keys/${name}.json`
  if (!existsSync(path)) {
    mkdirSync("keys", { recursive: true })
    writeFileSync(path, JSON.stringify({ privateKey: generatePrivateKey() }, null, 2), { mode: 0o600 })
  }
  const { privateKey } = JSON.parse(readFileSync(path, "utf8"))
  return privateKeyToAccount(privateKey)
}

export function walletFor(name: string) {
  const account = loadKey(name)
  return createWalletClient({ account, chain: polkadotHubTestnet, transport: http() })
}
