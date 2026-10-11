import { formatEther } from "viem"
import { loadKey, publicClient } from "./chain"

const name = process.argv[2] ?? "organizer"
const account = loadKey(name)
const balance = await publicClient.getBalance({ address: account.address })
console.log(`${name} ${account.address} ${formatEther(balance)} PAS`)
