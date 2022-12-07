# Retriev - Smart Contract

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

# Smart Contract Security

At the moment the contract was not audited from a third party. We used popular tool [slither](https://github.com/crytic/slither) to analyze our contract and this is the result:

```
Number of lines: 1566 (+ 1203 in dependencies, + 0 in tests)
Number of assembly lines: 0
Number of contracts: 5 (+ 13 in dependencies, + 0 tests) 

Number of optimization issues: 0
Number of informational issues: 94
Number of low issues: 16
Number of medium issues: 7
Number of high issues: 2

Use: Openzeppelin-Ownable, Openzeppelin-SafeMath
ERCs: ERC721, ERC165

+-------------+-------------+---------------+------------+--------------+-------------+
|     Name    | # functions |      ERCS     | ERC20 info | Complex code |   Features  |
+-------------+-------------+---------------+------------+--------------+-------------+
|   Retriev   |      84     | ERC165,ERC721 |            |     Yes      | Receive ETH |
|             |             |               |            |              |   Send ETH  |
|             |             |               |            |              |  Ecrecover  |
|             |             |               |            |              |   Assembly  |
|    Base64   |      2      |               |            |      No      |   Assembly  |
|   IRENDER   |      2      |     ERC165    |            |      No      |             |
| TokenRender |      7      |               |            |     Yes      |             |
+-------------+-------------+---------------+------------+--------------+-------------+
```


# Smart Contract Testing

An extended documentation that explains how to run tests on the contract can be found [here](./TESTS.md).