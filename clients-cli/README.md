# Retriev Protocol - Clients CLI

Client's CLI is intended to be used as terminal tool to interact with the protocol so you can expect to do following things:

- **Obtain providers list**: you can ask current providers list to deal with
- **Create deals**: you can create deals with providers by passing a data uri or reading a local file
- **Retrieve files**: you can retrieve files from provider and download them
- **Make appeals**: you can make appeals for a specific deal, asking the referees to check file and eventually get a refund
- **Withdraw funds**: you can withdraw funds if they got unlocked by the protocol

## Build CLI from source

CLI is written in NodeJS so we assume you have git, NodeJS >= 16 and YARN installed.

You will also need a web3 provider (we suggest [Infura](https://infura.io)) to interact with blockchain. 

After you've met all required dependencies you can start following those steps:

```
git clone https://github.com/protocol/retriev
cd clients-cli
yarn
```

Now you need to configure your node following those steps:

```
cp .env.goerli .env
nano .env
```

you will see something like:
```
CONTRACT_ADDRESS=0x31FEbE602b8088bB96cfbb5Ba44A9b62B3b9845d
WEB3_PROVIDER=https://goerli.infura.io/v3/API_KEY
API_URL=https://api.pldr.dev
```

now replace your Infura api key in the second row, instead of `API_KEY`. Close and save the file now.

You're ready to interact with retrieval pinning protocol!

## Compile binaries

Optionally you can also compile binaries and use the package as a native application for your operating system.
To compile the client you will just need to prompt:
```
yarn compile
```

you should obtain a response like:
```
yarn run v1.22.17
$ pkg . --out-path bin
> pkg@5.6.0
> Targets not specified. Assuming:
  node16-linux-x64, node16-macos-x64, node16-win-x64
Done in 6.91s.
```

you will find compiled binaries in `clients-cli/bin` folder.

## Start for the first time

At first start the CLI will create a new blockchain identity for you so please now run:

```
yarn identity
```

client will print something like:
```
Can't find configs for node rpp-client, creating.
Generating new identity for node.
New identity is: 0xF941940Df2191B1354dBCF9160C2782bfF638378
0xF941940Df2191B1354dBCF9160C2782bfF638378
Done in 0.35s.
```
In this case: `0xF941940Df2191B1354dBCF9160C2782bfF638378` is your identity and you will be able to find generated private key (or insert your private key) in configs folder: 
```
nano $HOME/.rpp/rpp-client/configs.json
```

Please make sure to make a backup of this key and never share it. You will be able to import it in Metamask or other wallets. You will probably need some spare `rETH` and you can ask them from [Alchemy's goerli faucet](https://goerlifaucet.com/).

## Interact with protocol

Now we'll explain deeply how any command works. If you need any support you can also enter our [Slack channel](https://filecoinproject.slack.com/archives/C03CJKWP2DR) and ask for support!

### Providers list

This command will return and print the list of current active providers:
```
yarn providers
```
will print out something like following table, if you see it "strange" please simply open the window a little bit more.
```
Asking deals to API..
Found 1 providers.
┌─────────┬─────────────────────────────┬──────────────────────────────────────────────┬───────────┬──────────┬───────────────────────────┬──────────────┐
│ (index) │          endpoint           │                   address                    │ min_price │ max_size │ max_collateral_multiplier │ max_duration │
├─────────┼─────────────────────────────┼──────────────────────────────────────────────┼───────────┼──────────┼───────────────────────────┼──────────────┤
│    0    │ 'https://provider.pldr.dev' │ '0x2489c48090523f37028f1e42454b7DD04943d0Bf' │     1     │ 20000000 │           1000            │      90      │
└─────────┴─────────────────────────────┴──────────────────────────────────────────────┴───────────┴──────────┴───────────────────────────┴──────────────┘
Done in 1.02s.
```

As you can see there is also provider's strategy like `min_price` or `max_duration`. You will need to pay attention to those values if you want to successful create deals.

### Make deal

This is core command, you can use it in two different ways:

- *Basic*: by passing minimal informations of `file`, `provider` and `duration`.
- *Advanced: by passing also `value`, `collateral` and `dealuri`.

**Basic mode** can be tested using following command (make sure you are inside `clients-cli` folder):
```
yarn deal --file=../shared/vps.txt --provider='0x2489c48090523f37028f1e42454b7DD04943d0Bf' --duration=60
```

it will print out something like:
```
💽 Checking if provider is valid..
📝 Reading state from contract..
💳 Creating deal from address: 0xF941940Df2191B1354dBCF9160C2782bfF638378
⏱️  Deal duration is: 60 days.
💾 File size is: 200 byte
☁️  Uploading file to cache node..
🤙 Creating deal with URI: ipfs://bafkreidtskz64q2len4yzdkn2qxcxlwdh42wjtlpohydyjstboinepceya
💸 Paying 1036800000 wei for the deal.
💰 Wallet's balance is: 10000000000000000 wei
⌛ Pending transaction at: 0x3e27337abe1e760d0ef8d372050547c93a302de85edf0eecd235f9cff963c264
🎉 Deal created at 0x3e27337abe1e760d0ef8d372050547c93a302de85edf0eecd235f9cff963c264!
Done in 23.22s.
```

**Advanced mode** can be tested using following command (please remember you can use `file` or `dealuri` in both modes, just be sure provided `dealuri` is available for retrieval):
```
yarn deal --dealuri='ipfs://bafkreiaoeqvdretuu7mzr4kjrxvifiykfp73rk5rb7b62o7j5hvlmwg5ru' --provider='0x2489c48090523f37028f1e42454b7DD04943d0Bf' --duration=60 --value=0 --collateral=0
```
it will print something similar to the previous response, so there's no need to show again the example. The only difference is that it will not automatically calculate deal price and will not upload the file to protocol's cache node.

## Obtaining deals

You can see your deals list by using following command:

```
yarn deals
```

it will print something like (please make sure window has enough width or reduce font size):
```
Asking deals to API..
Found 2 deals.
┌─────────┬───────────┬──────────────────────────────────────────────────────────────────────┬──────────────┬──────────────────────────────────────────────┬──────────────────────────┬──────────────────────────┐
│ (index) │ dealIndex │                               dealUri                                │    value     │                   provider                   │         start_at         │          end_at          │
├─────────┼───────────┼──────────────────────────────────────────────────────────────────────┼──────────────┼──────────────────────────────────────────────┼──────────────────────────┼──────────────────────────┤
│    0    │    57     │ 'ipfs://bafkreidtskz64q2len4yzdkn2qxcxlwdh42wjtlpohydyjstboinepceya' │ '1036800000' │ '0x2489c48090523f37028f1e42454b7DD04943d0Bf' │ 2022-08-30T04:57:43.000Z │ 2022-10-29T04:57:43.000Z │
│    1    │    58     │ 'ipfs://bafkreiaoeqvdretuu7mzr4kjrxvifiykfp73rk5rb7b62o7j5hvlmwg5ru' │     '0'      │ '0x2489c48090523f37028f1e42454b7DD04943d0Bf' │ 2022-08-30T04:59:43.000Z │ 2022-10-29T04:59:43.000Z │
└─────────┴───────────┴──────────────────────────────────────────────────────────────────────┴──────────────┴──────────────────────────────────────────────┴──────────────────────────┴──────────────────────────┘
Done in 1.03s.
```

## Retrieve files

You can download files from providers by using following command:
```
yarn retrieve 57
```
or using following command:
```
yarn retrieve --dealuri=ipfs://bafkreidtskz64q2len4yzdkn2qxcxlwdh42wjtlpohydyjstboinepceya
```

As you can see you can use `dealIndex` or `dealUri` as parameters to download files. File will be downloaded in protocol's folder:
```
$HOME/.rpp/rpp-client/retrievals
```

## Make appeals

To make appeals you can run following command:
```
yarn appeal <DEAL_INDEX>
```

Please remember that any appeal will cost you some `rETH` so be 100% sure file is not retrievable or you will basically lose money.

You will receive something like:
```
🚩 Making appeal to deal #57
Fee for appeal is: 0.0000000002592
⌛ Pending transaction at: 0xb771322f3e9816fc357966197cc0419768b321b0103d9664c5c31fc4bc252b78
🎉 Appeal created at 0xb771322f3e9816fc357966197cc0419768b321b0103d9664c5c31fc4bc252b78!
Done in 20.34s.
```

## Withdraw from contract

If one (or more) appeals end with a "slash" (please read [paper](../PAPER.md) for extended explanation) you will be refunded and you'll be able to withdraw funds back from contract to your account by using:
```
yarn withdraw
```

# Use dApp at onchain.storage

You will also able to use the protocol by interacting with [onchain.storage](https://onchain.storage) dApp. Of course you will need to import the private key to Metamask to see the same deals.

# Contributions and support

Feel free to open issues or PR to contribute the project or join our [Slack channel](https://filecoinproject.slack.com/archives/C03CJKWP2DR) to chat with us!