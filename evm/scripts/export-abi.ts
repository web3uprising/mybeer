import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const artifact = JSON.parse(readFileSync(join(__dirname, "../artifacts/contracts/Moeda.sol/Moeda.json"), "utf8"))
const target = join(__dirname, "../../apps/shared/src/generated/moeda.ts")

writeFileSync(
  target,
  `export const moedaAbi = ${JSON.stringify(artifact.abi, null, 2)} as const\n\nexport const moedaBytecode = "${artifact.bytecode}" as const\n`,
)
console.log(`wrote ${target}`)
