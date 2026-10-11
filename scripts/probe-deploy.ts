import { encodeDeployData, parseUnits } from "viem"
import { moedaAbi, moedaBytecode } from "../apps/shared/src/generated/moeda"
import { publicClient } from "./chain"

const data = encodeDeployData({ abi: moedaAbi, bytecode: moedaBytecode, args: ["Probe", "PRB", parseUnits("1000", 18), 0n, 500n, 100n] })
const block = await publicClient.getBlock()
console.log("baseFee", block.baseFeePerGas, "gasPrice", await publicClient.getGasPrice())
try {
  console.log("estimate (no from):", await publicClient.estimateGas({ data, account: "0x0000000000000000000000000000000000000001" }))
} catch (e) {
  console.log("estimate failed:", (e as Error).message.split("\n").slice(0, 3).join(" | "))
}
try {
  const r = await publicClient.call({ data, account: "0x0000000000000000000000000000000000000001" })
  console.log("eth_call deploy ok, returned bytes:", (r.data?.length ?? 2) / 2 - 1)
} catch (e) {
  console.log("call failed:", (e as Error).message.split("\n").slice(0, 3).join(" | "))
}
