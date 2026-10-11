import { createWalletClient, http, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { polkadotHubTestnet } from "../src/chain"
import { loadKey, publicClient } from "./chain"

if (!process.env.RPC_URL?.includes("127.0.0.1")) throw new Error("devnet only")
const rich = createWalletClient({
  account: privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
  chain: polkadotHubTestnet,
  transport: http(),
})
for (const to of process.argv.slice(2)) {
  const address = to.startsWith("0x") ? (to as `0x${string}`) : loadKey(to).address
  const hash = await rich.sendTransaction({ to: address, value: parseEther("100") })
  await publicClient.waitForTransactionReceipt({ hash })
  console.log("funded", to, address)
}
