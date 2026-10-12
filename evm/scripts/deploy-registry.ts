import hre from "hardhat"
import { explorer, polkadotHubTestnet } from "./network"

async function main() {
  const publicClient = await hre.viem.getPublicClient({ chain: polkadotHubTestnet })
  const [wallet] = await hre.viem.getWalletClients({ chain: polkadotHubTestnet })
  const registry = await hre.viem.deployContract("CoinRegistry", [], { client: { public: publicClient, wallet } })
  console.log(`CoinRegistry deployed at ${registry.address}`)
  console.log(`${explorer}/address/${registry.address}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
