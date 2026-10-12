# mybeer

Pagar um fino com uma moeda própria na Polkadot Hub TestNet. Material do workshop WEB3UP x
ACM FEUP.

| Pasta | O que é |
|---|---|
| `apps/wallet` | A carteira no telemóvel de quem paga. Cria a chave no browser, mostra saldos, lança moedas, envia e paga. |
| `apps/terminal` | O terminal da loja no Chrome do SUNMI V3. Pede o número de cervejas e a moeda, mostra o QR do pagamento e espera que chegue à cadeia. |
| `apps/shared` | Código comum às duas apps: rede, carteira, moedas, QR e estilos. |
| `evm` | A moeda de exemplo do Level 1 e o registo de moedas aceites no bar, em Hardhat, com testes e deploy. |
| `scripts` | Ferramentas do organizador: conta, envio de PAS e teste ponta a ponta. |

## Correr

```sh
npm install
npm test                         # testes da moeda de exemplo
npm run dev -w apps/wallet       # http://localhost:5173
npm run dev -w apps/terminal     # http://localhost:5174
npm run build                    # apps/*/dist
```

As apps apontam uma para a outra pelos endereços em `apps/shared/src/links.ts`, que mudam com
`VITE_WALLET_URL` e `VITE_TERMINAL_URL`.

## Rede

Polkadot Hub TestNet, chain id `420420417`, RPC `https://eth-rpc-testnet.polkadot.io/`,
explorador `https://blockscout-testnet.polkadot.io`. Os blocos saem a cada 2,4 s.

O RPC da Polkadot rejeita `null` dentro de `topics` em `eth_getLogs`. O terminal pede todos
os `Transfer` da moeda e filtra o destino no browser por isso.

## Registo de moedas

O terminal lê as moedas aceites do contrato `CoinRegistry` em
`0xe7d799147276e7de57a41b8e00eb7d396b43537a`, que muda com `VITE_REGISTRY_ADDRESS`. Qualquer
pessoa adiciona uma moeda que cumpra a interface ERC20, com o preço de uma cerveja. Só quem a
adicionou, ou o dono do registo, muda o preço ou a retira.

```sh
REGISTRY_ADDRESS=0xe7d7… COIN_ADDRESS=0x… BEER_PRICE=2 npm run add-coin -w evm
```

## Imprimir no SUNMI

O Chrome dentro do dot.li não chega à impressora do SUNMI, por isso o botão Imprimir abre uma
ligação `mybeer-print:` que a app em `android/print-bridge` recebe e entrega ao serviço de
impressão do SUNMI. Compila e instala uma vez por terminal, com o SDK do Android:

```sh
android/print-bridge/build.sh
adb install -r android/print-bridge/build/print-bridge.apk
```

## Publicar num domínio .dot

O gateway dot.li corre a app numa moldura e serve sempre o `index.html`. Uma app que recarrega
a página perde os parâmetros do gateway e mostra "Invalid sandbox URL", por isso cada app é uma
só página que nunca navega.

```sh
npm run build -w apps/wallet
pad apps/wallet/dist mybeer-wallet.dot --env devnet --mnemonic "$DOTNS_MNEMONIC"
```

A conta de publicação precisa de PAS na Paseo Asset Hub, de `dotns account map` e de
autorização no Bulletin. Ver https://docs.polkadotcommunity.foundation/getting-started/developers/.

## Organizador

```sh
npx tsx scripts/whoami.ts organizer          # cria keys/organizer.json e mostra o saldo
npx tsx scripts/deploy.ts "Fino Coin" FINO 1000000 0 5 1
npx tsx scripts/e2e.ts <endereço da moeda>  # paga e confirma a deteção, ponta a ponta
```

`keys/` não vai para o git.
