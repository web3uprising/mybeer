import { getAddress } from "viem"
import { coinRegistryAbi } from "../generated/coin-registry"
import { readToken, type TokenInfo } from "./tokens"
import { publicClient } from "./wallet"

export const REGISTRY_ADDRESS = getAddress(import.meta.env.VITE_REGISTRY_ADDRESS ?? "0xe7d799147276e7de57a41b8e00eb7d396b43537a")

export interface ListedCoin extends TokenInfo {
  beerPrice: bigint
}

export async function listedCoins(): Promise<ListedCoin[]> {
  const coins = await publicClient.readContract({ address: REGISTRY_ADDRESS, abi: coinRegistryAbi, functionName: "coins" })
  const read = await Promise.allSettled(coins.map(async (coin) => ({ ...(await readToken(coin.token)), beerPrice: coin.beerPrice })))
  return read.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []))
}
