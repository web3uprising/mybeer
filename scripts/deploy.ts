import { parseUnits } from "viem"
import { moedaAbi, moedaBytecode } from "../src/generated/moeda"
import { publicClient, walletFor } from "./chain"

const [name = "Fino Coin", symbol = "FINO", supply = "1000000", max = "0", inflationPct = "5", feePct = "1"] = process.argv.slice(2)
const wallet = walletFor("organizer")

const hash = await wallet.deployContract({
  abi: moedaAbi,
  bytecode: moedaBytecode,
  args: [name, symbol, parseUnits(supply, 18), parseUnits(max, 18), BigInt(Math.round(Number(inflationPct) * 100)), BigInt(Math.round(Number(feePct) * 100))],
})
const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 180_000 })
console.log(JSON.stringify({ symbol, address: receipt.contractAddress, hash, block: receipt.blockNumber.toString(), gasUsed: receipt.gasUsed.toString() }))
