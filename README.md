# Criar uma Moeda

Material do workshop WEB3UP x ACM FEUP. Cada equipa desenha uma moeda, lança-a na
Polkadot Hub TestNet e paga com ela num terminal SUNMI.

Tem uma página web com dois ecrãs e um contrato. O gateway .dot serve sempre o
`index.html`, por isso o ecrã vem do parâmetro `ecra` e a app nunca recarrega a página.

- `?ecra=carteira` corre no telemóvel de quem paga. Cria a chave no próprio browser,
  mostra saldos, lança moedas, envia e paga.
- `?ecra=terminal` corre no Chrome do SUNMI V3. Recebe o valor no teclado, mostra o QR
  do pagamento e fica a ver a cadeia até o pagamento chegar.
- `contracts/Moeda.sol` é um ERC-20 com quantidade máxima, inflação anual que o dono
  emite quando quiser, e uma taxa por pagamento que vai para o dono.

## Rede

Polkadot Hub TestNet, chain id `420420417`, RPC `https://eth-rpc-testnet.polkadot.io/`,
explorador `https://blockscout-testnet.polkadot.io`. Os blocos saem a cada 2,4 s.
O gás custa cerca de 0,8 PAS para lançar uma moeda e 0,06 PAS por pagamento.

O RPC da Polkadot rejeita `null` dentro de `topics` em `eth_getLogs`. O terminal pede
todos os `Transfer` da moeda e filtra o destino no browser por isso.

## Correr

```sh
npm install
npm run compile      # gera src/generated/moeda.ts
npm run dev          # http://localhost:5173
npm run build        # dist/ estático para alojar
```

No SUNMI ligado por USB, `adb reverse tcp:5173 tcp:5173` e abrir
`http://localhost:5173/?ecra=terminal` no Chrome. Para o workshop as páginas têm de estar
num endereço HTTPS público, senão a câmara da carteira não abre.

## Organizador

```sh
npx tsx scripts/whoami.ts organizer          # cria keys/organizer.json e mostra o saldo
npx tsx scripts/deploy.ts "Fino Coin" FINO 1000000 0 5 1
npx tsx scripts/e2e.ts <endereço da moeda>  # paga e confirma a deteção, ponta a ponta
```

`keys/` não vai para o git. Pedir PAS em https://faucet.polkadot.io para o endereço do
organizador e distribuir pelas carteiras com o botão Enviar.

Para testar sem PAS existe uma rede local com o mesmo chain id:
`RPC_URL=http://127.0.0.1:8545` nos scripts e `VITE_RPC_URL` no `npm run dev`.

## Na sala

1. Cada pessoa abre a carteira e mostra o código de Receber. O organizador envia 1 PAS.
2. A equipa toca em Criar moeda, escolhe quantidade, máximo, inflação e taxa, e lança.
3. A página da moeda mostra um QR. O terminal lê esse QR em Ler QR da moeda.
4. A equipa distribui moedas com Enviar. Quem compra aponta a câmara ao QR do terminal.

## Publicar

A app está em https://criar-uma-moeda.dev-dot.li, na devnet da Polkadot. A chave de
publicação está em `keys/dotns.env`, fora do git.

```sh
set -a; . keys/dotns.env; set +a
npm run build && pad ./dist criar-uma-moeda.dot --env devnet --mnemonic "$DOTNS_MNEMONIC"
```
