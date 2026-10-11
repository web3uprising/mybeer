import { formatEther, formatUnits, parseAbiItem, parseEther, parseUnits, type Address } from "viem"
import { moedaAbi } from "../apps/shared/src/generated/moeda"
import { decodePaymentRequest, encodePaymentRequest } from "../apps/shared/src/lib/pay-uri"
import { loadKey, publicClient, walletFor } from "./chain"

const token = process.argv[2] as Address
if (!token) throw new Error("usage: e2e.ts <token>")
const chainId = await publicClient.getChainId()

const organizer = walletFor("organizer")
const customer = walletFor("customer-e2e")
const merchant = loadKey("merchant-e2e").address
const transfer = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)")

async function wait(hash: `0x${string}`) {
  const r = await publicClient.waitForTransactionReceipt({ hash, timeout: 180_000 })
  if (r.status !== "success") throw new Error(`tx failed ${hash}`)
  return r
}

console.log("1. fund customer with PAS and tokens")
await wait(await organizer.sendTransaction({ to: customer.account.address, value: parseEther("2") }))
await wait(await organizer.writeContract({ address: token, abi: moedaAbi, functionName: "transfer", args: [customer.account.address, parseUnits("100", 18)] }))

const amount = parseUnits("2.5", 18)
const uri = encodePaymentRequest({ token, to: merchant, amount, chainId })
console.log("2. terminal shows", uri)
const request = decodePaymentRequest(uri)!
const startBlock = await publicClient.getBlockNumber()

console.log("3. customer pays")
const payHash = await customer.writeContract({ address: token, abi: moedaAbi, functionName: "transfer", args: [request.to, request.amount] })

console.log("4. terminal watches logs")
let found = null
for (let i = 0; i < 60 && !found; i++) {
  const latest = await publicClient.getBlockNumber({ cacheTime: 0 })
  const logs = await publicClient.getLogs({ address: token, event: transfer, fromBlock: startBlock - 2n, toBlock: latest })
  found = logs.find((l) => l.args.to?.toLowerCase() === merchant.toLowerCase() && l.args.value === amount) ?? null
  if (!found) await new Promise((r) => setTimeout(r, 2000))
}
if (!found) throw new Error("payment not detected")
console.log("   detected", found.transactionHash, "block", found.blockNumber, found.transactionHash === payHash ? "(same tx)" : "(DIFFERENT tx)")

const [mBal, cBal, fee, gas] = await Promise.all([
  publicClient.readContract({ address: token, abi: moedaAbi, functionName: "balanceOf", args: [merchant] }),
  publicClient.readContract({ address: token, abi: moedaAbi, functionName: "balanceOf", args: [customer.account.address] }),
  publicClient.readContract({ address: token, abi: moedaAbi, functionName: "feeFor", args: [amount] }),
  publicClient.getBalance({ address: customer.account.address }),
])
console.log(`5. merchant ${formatUnits(mBal, 18)} | customer ${formatUnits(cBal, 18)} | fee ${formatUnits(fee, 18)} | customer PAS ${formatEther(gas)}`)
if (mBal !== amount) throw new Error("merchant did not receive exact amount")
console.log("E2E OK")
