import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers"
import { expect } from "chai"
import hre from "hardhat"
import { getAddress, parseUnits } from "viem"

const million = parseUnits("1000000", 18)
const twoFinos = parseUnits("2", 18)

async function deployRegistry() {
  const [owner, alice, bob] = await hre.viem.getWalletClients()
  const registry = await hre.viem.deployContract("CoinRegistry")
  const fino = await hre.viem.deployContract("Moeda", ["Fino", "FINO", million, 0n, 0n, 0n])
  const imperial = await hre.viem.deployContract("Moeda", ["Imperial", "IMPE", million, 0n, 0n, 0n])
  return { registry, fino, imperial, owner, alice, bob }
}

describe("CoinRegistry", () => {
  it("lists a coin with its beer price and who added it", async () => {
    const { registry, fino, alice } = await loadFixture(deployRegistry)
    await registry.write.addCoin([fino.address, twoFinos], { account: alice.account })
    expect(await registry.read.coins()).to.deep.equal([
      { token: getAddress(fino.address), beerPrice: twoFinos, addedBy: getAddress(alice.account.address) },
    ])
  })

  it("rejects an address that is not an ERC20", async () => {
    const { registry, alice } = await loadFixture(deployRegistry)
    await expect(registry.write.addCoin([alice.account.address, twoFinos])).to.be.rejectedWith("NotERC20")
    await expect(registry.write.addCoin([registry.address, twoFinos])).to.be.rejectedWith("NotERC20")
  })

  it("rejects the same coin twice and a zero price", async () => {
    const { registry, fino } = await loadFixture(deployRegistry)
    await expect(registry.write.addCoin([fino.address, 0n])).to.be.rejectedWith("ZeroPrice")
    await registry.write.addCoin([fino.address, twoFinos])
    await expect(registry.write.addCoin([fino.address, twoFinos])).to.be.rejectedWith("AlreadyAdded")
  })

  it("lets only whoever added the coin or the owner change its price", async () => {
    const { registry, fino, alice, bob } = await loadFixture(deployRegistry)
    await registry.write.addCoin([fino.address, twoFinos], { account: alice.account })
    await expect(registry.write.setBeerPrice([fino.address, 1n], { account: bob.account })).to.be.rejectedWith("NotAllowed")
    await registry.write.setBeerPrice([fino.address, 3n], { account: alice.account })
    await registry.write.setBeerPrice([fino.address, 4n])
    expect((await registry.read.coins())[0].beerPrice).to.equal(4n)
  })

  it("removes a coin and keeps the others listed", async () => {
    const { registry, fino, imperial } = await loadFixture(deployRegistry)
    await registry.write.addCoin([fino.address, twoFinos])
    await registry.write.addCoin([imperial.address, twoFinos])
    await registry.write.removeCoin([fino.address])
    expect((await registry.read.coins()).map((coin) => coin.token)).to.deep.equal([getAddress(imperial.address)])
    expect(await registry.read.isAdded([fino.address])).to.equal(false)
    await registry.write.removeCoin([imperial.address])
    expect(await registry.read.coins()).to.deep.equal([])
  })
})
