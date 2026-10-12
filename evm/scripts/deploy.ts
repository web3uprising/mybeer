import hre from "hardhat"
import { defineChain, parseUnits } from "viem"

const name = process.env.COIN_NAME ?? "Fino"
const symbol = process.env.COIN_SYMBOL ?? "FINO"
const initialSupply = parseUnits(process.env.COIN_INITIAL ?? "1000000", 18)
const maxSupply = parseUnits(process.env.COIN_MAX ?? "2000000", 18)
const inflationBps = BigInt(process.env.COIN_INFLATION_BPS ?? "500")
const feeBps = BigInt(process.env.COIN_FEE_BPS ?? "100")

const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: "Polkadot Hub TestNet",
  nativeCurrency: { name: "Paseo", symbol: "PAS", decimals: 18 },
  rpcUrls: { default: { http: [process.env.RPC_URL ?? "https://eth-rpc-testnet.polkadot.io/"] } },
})

async function main() {
  const publicClient = await hre.viem.getPublicClient({ chain: polkadotHubTestnet })
  const [wallet] = await hre.viem.getWalletClients({ chain: polkadotHubTestnet })
  const moeda = await hre.viem.deployContract("Moeda", [name, symbol, initialSupply, maxSupply, inflationBps, feeBps], {
    client: { public: publicClient, wallet },
  })
  console.log(`${symbol} deployed at ${moeda.address}`)
  console.log(`https://blockscout-testnet.polkadot.io/address/${moeda.address}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
