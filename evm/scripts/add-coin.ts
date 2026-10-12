import hre from "hardhat"
import { getAddress, parseUnits } from "viem"
import { explorer, polkadotHubTestnet } from "./network"

const registryAddress = getAddress(required("REGISTRY_ADDRESS"))
const coinAddress = getAddress(required("COIN_ADDRESS"))
const beerPrice = required("BEER_PRICE")

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`set ${name}`)
  return value
}

async function main() {
  const publicClient = await hre.viem.getPublicClient({ chain: polkadotHubTestnet })
  const [wallet] = await hre.viem.getWalletClients({ chain: polkadotHubTestnet })
  const client = { public: publicClient, wallet }
  const coin = await hre.viem.getContractAt("Moeda", coinAddress, { client })
  const registry = await hre.viem.getContractAt("CoinRegistry", registryAddress, { client })
  const price = parseUnits(beerPrice, await coin.read.decimals())
  const hash = await registry.write.addCoin([coinAddress, price])
  await publicClient.waitForTransactionReceipt({ hash })
  console.log(`${await coin.read.symbol()} added at ${beerPrice} per beer`)
  console.log(`${explorer}/tx/${hash}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
