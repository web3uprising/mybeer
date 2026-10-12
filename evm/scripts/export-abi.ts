import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

function exportAbi(contract: string, file: string, name: string) {
  const artifact = JSON.parse(readFileSync(join(__dirname, `../artifacts/contracts/${contract}.sol/${contract}.json`), "utf8"))
  const target = join(__dirname, `../../apps/shared/src/generated/${file}.ts`)
  writeFileSync(
    target,
    `export const ${name}Abi = ${JSON.stringify(artifact.abi, null, 2)} as const\n\nexport const ${name}Bytecode = "${artifact.bytecode}" as const\n`,
  )
  console.log(`wrote ${target}`)
}

exportAbi("Moeda", "moeda", "moeda")
exportAbi("CoinRegistry", "coin-registry", "coinRegistry")
