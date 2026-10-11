import hre from "hardhat"
import { parseUnits } from "viem"

const name = process.env.COIN_NAME ?? "Fino"
const symbol = process.env.COIN_SYMBOL ?? "FINO"
const initialSupply = parseUnits(process.env.COIN_INITIAL ?? "1000000", 18)
const maxSupply = parseUnits(process.env.COIN_MAX ?? "2000000", 18)
const inflationBps = BigInt(process.env.COIN_INFLATION_BPS ?? "500")
const feeBps = BigInt(process.env.COIN_FEE_BPS ?? "100")

async function main() {
  const moeda = await hre.viem.deployContract("Moeda", [name, symbol, initialSupply, maxSupply, inflationBps, feeBps])
  console.log(`${symbol} deployed at ${moeda.address}`)
  console.log(`https://blockscout-testnet.polkadot.io/address/${moeda.address}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
