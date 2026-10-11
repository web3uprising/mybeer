# Moeda de exemplo

A solução do Level 1: uma moeda ERC-20 lançada na Polkadot Hub TestNet. As equipas fazem a
sua com o prompt do slide e podem comparar com esta.

`contracts/Moeda.sol` junta ao ERC-20 da OpenZeppelin um máximo, uma inflação anual que só o
dono emite, e uma taxa por transferência paga a mais e enviada para o tesouro.

```sh
npm install                 # na raiz do repositório
npm test -w evm             # corre os testes numa rede local do Hardhat
PRIVATE_KEY=0x… npm run deploy -w evm
npm run export-abi -w evm   # atualiza o ABI que as apps usam
```

O deploy usa os valores do slide: Fino, FINO, 1 000 000 no início, máximo de 2 000 000,
inflação de 5% e taxa de 1%. Mudam com `COIN_NAME`, `COIN_SYMBOL`, `COIN_INITIAL`,
`COIN_MAX`, `COIN_INFLATION_BPS` e `COIN_FEE_BPS`.
