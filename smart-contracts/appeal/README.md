# Retriev Appeal - Smart Contract

This contract is meant to be used as a collector for the new "deals without proposal" we introduced in latest Retriev implementation. 
Any provider can now create deals without a deal proposal, putting down some collateral and allowing anyone (if they use this contract or a version of this contract) make appeals on that deals.

## Requirements

You will need `NodeJS` and `YARN` installed in your machine, if you're ready to start just install dependencies with:

```
yarn
```

## Init local network

To init a new hardhat network you'll need to run:
```
yarn network
```

With this command a new `hardhat.json` file will be created, a new mnemonic will be created (don't use default one in any case) and a new hardhat network will run. Leave this terminal opened and open a new one.

## Deploy contract

To deploy the contract simply run:

```
yarn task deploy hardhat
```

With this command we're saying the `scripts/_task.js` to run the `scripts/deploy.js` file using `configs/hardhat.json` file.

## Run other scripts

As you can easily understand you're now able to write your own scripts (or tests) and use it like:

```
yarn task myscript hardhat
```

or you can change the `hardhat` with `goerli` (for instance) and deploy to goerli network. Of course you will need to setup your own `provider` inside the `configs/goerli.json` file adding an Alchemy, Infura or whatsoever provider.