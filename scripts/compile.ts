import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)
const solc = require("solc")

const input = {
  language: "Solidity",
  sources: { "Moeda.sol": { content: readFileSync("contracts/Moeda.sol", "utf8") } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
}

function findImports(path: string) {
  try {
    return { contents: readFileSync(join(dirname(require.resolve("@openzeppelin/contracts/package.json")), "..", "..", path), "utf8") }
  } catch {
    return { error: `not found: ${path}` }
  }
}

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))
const errors = (output.errors ?? []).filter((e: { severity: string }) => e.severity === "error")
if (errors.length) {
  for (const e of errors) console.error(e.formattedMessage)
  process.exit(1)
}
const { abi, evm } = output.contracts["Moeda.sol"].Moeda
mkdirSync("src/generated", { recursive: true })
writeFileSync(
  "src/generated/moeda.ts",
  `export const moedaAbi = ${JSON.stringify(abi, null, 2)} as const\n\nexport const moedaBytecode = "0x${evm.bytecode.object}" as const\n`,
)
console.log(`compiled Moeda: ${evm.bytecode.object.length / 2} bytes`)
