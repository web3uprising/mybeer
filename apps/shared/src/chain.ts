import { defineChain } from "viem"

const rpcOverride =
  (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.VITE_RPC_URL) ||
  (typeof process !== "undefined" ? process.env.RPC_URL : undefined)

export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: "Polkadot Hub TestNet",
  nativeCurrency: { name: "Paseo", symbol: "PAS", decimals: 18 },
  rpcUrls: { default: { http: [rpcOverride || "https://eth-rpc-testnet.polkadot.io/"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://blockscout-testnet.polkadot.io" } },
  testnet: true,
})
