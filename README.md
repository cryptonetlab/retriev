# Protocol Labs - Retrieval Pinning

Retrieval Pinning is a Protocol designed by [CryptoNetLab](https://cryptonet.org/) and developed by [YOMI](https://yomi.digital) that allows end users create retrieval deals with a subset of IPFS providers, it leverages on a reliable system of “missed retrieval” penalties that increases the confidence in decentralized storage networks.

If you want to go deeper on how the protocol works please read our [light paper](./PAPER.md).

We have now two active deployments:
- Polygon network at [0xc8834A8b64ad66668B11240Dc12B3EE32bA02c5B](https://polygonscan.com/address/0xc8834A8b64ad66668B11240Dc12B3EE32bA02c5B). 
- Goerli network at [0x7Aa765411207De8614C5044D25c58148F017DD80](https://goerli.etherscan.io/address/0x7Aa765411207De8614C5044D25c58148F017DD80).

If you want to learn more about the project please visit our [official website](https://retriev.org).
# Architecture

The protocol consists of three main elements:
- **Smart Contract**: which is the core of the procotol, where the rules are written and from where you can create deals or create appeals.
- **Referee network**: which is the guarantee that the protocol is respected and from where appeal requests are processed. 
- **Provider network**: which is the network of providers, where all data are stored and from where data should be retrieved.

Of course the end users (who wants to store data and make deals) can interact directly with the protocol using the blockchain, however we created a simple interface to make deals.

At the moment there's no interface for providers but we're working on Providers's part of the protocol and it will be available soon.

## Technologies used

We used a bunch of different technologies to create the protocol:
- **Smart Contract:** we used `Solidity` to create the contract, so it will run on any EVM chain.
- **Provider / Referee network:** is a `NodeJS` application that uses `socket.io` to establish a communication between peers. Final application is compiled using `pkg`.
- **Client UI / Website:** both are static websites created with `VueJS`, deployment is done also using IPFS.
- **Client CLI:** is a `NodeJS` application compiled using `pkg`.
- **API:** is a `NodeJS` application built with `Express`.
## Project directories

Project is divided by subfolders, any folder contains a different piece of the protocol:
- `shared`: which contains a shared library to bootstrap nodes, dial with web3 and communicate between peers.
- `smart-contract`: which contains *smart contract* logic to create the deals and run the retrieval protocol if the *provider* doesn't provide the file. It will include the indexer too in order to process and store requests.
- `clients-cli`: which contains a basic CLI to interact with contract, create deals and appeals.
- `provider-cli`: which contains *provider* logic to accept deals published on-chain and serve deal files.
- `referee-cli`: which contains *referee* logic to ask `providers` if some clients asks for a retrieval.
- `stress-cli`: which contains a tool to test the network over time.
- `docker`: which contains the Docker image and the scripts to build / run the node.
- `api`: which contains a *NodeJS* application that parses the blockchain and serves informations instantly.
- `ui`: which contains a *Frontend* application and website deployed at retriev.org.

# Smart Contract Security

At the moment the contract was not audited from a third party. We used popular tool [slither](https://github.com/crytic/slither) to analyze our contract and this is the result:

```
Number of lines: 1287 (+ 1203 in dependencies, + 0 in tests)
Number of assembly lines: 0
Number of contracts: 5 (+ 13 in dependencies, + 0 tests) 

Number of optimization issues: 11
Number of informational issues: 74
Number of low issues: 11
Number of medium issues: 4
Number of high issues: 2

Use: Openzeppelin-Ownable, Openzeppelin-SafeMath
ERCs: ERC165, ERC721

+--------------------+-------------+---------------+------------+--------------+-------------+
|        Name        | # functions |      ERCS     | ERC20 info | Complex code |   Features  |
+--------------------+-------------+---------------+------------+--------------+-------------+
| DataRetrievability |      78     | ERC165,ERC721 |            |     Yes      | Receive ETH |
|                    |             |               |            |              |   Send ETH  |
|                    |             |               |            |              |  Ecrecover  |
|                    |             |               |            |              |   Assembly  |
|       Base64       |      2      |               |            |      No      |   Assembly  |
|      IRENDER       |      2      |     ERC165    |            |      No      |             |
|    TokenRender     |      2      |               |            |      No      |             |
+--------------------+-------------+---------------+------------+--------------+-------------+
```

## Clients CLI

If you're looking for specific documentation to interact with protocol as a client please go [here](./clients-cli/README.md).

# Install Node

Installing a node is required *only* if you want to be part of the referee consortium or you want to be a provider. There are very few requirements to run the node, it depends if you want to run it using [Docker](https://www.docker.com/) or you want to build from source using [NodeJS](https://nodejs.org/en/).

Since we're using blockchain you need a web3 provider, in our case we need a `Rinkeby` provider and we suggest to signup for a free account at (Infura)[https://infura.io]. Please be sure to have your `API_KEY` (it will be provided by Infura's interface) before can continue following this guide.

## Install Node using Docker

To use docker follow these simple follow steps:

```
# Clone repository
git clone https://github.com/protocol/retrieval-pinning

# Run first building script
bash docker/scripts/build.sh API_KEY

# Run a node as referee
bash docker/scripts/start.sh referee

# Run a node as provider
bash docker/scripts/start.sh provider

# Stop node
bash docker/scripts/stop.sh
```

## Build node from source

If you want to build the node from the source you have to follow few steps, they're similar for both `provider` and `referee` so, assuming you're chosing one of them please change `NODE_TYPE` with `provider` or `referee`, depending on your choice.

Please be also sure to change `YOUR_INFURA_API_KEY` with your previously generated Infura Id.

```
# Clone repository
git clone https://github.com/protocol/retriev

# Install shared dependencies
bash shared/install.sh

# Install specific dependencies
cd ..
cd NODE_TYPE-cli
yarn

# Create .env file
cp .env.goerli .env
sed -i "s/API_KEY/YOUR_INFURA_API_KEY/" ./.env

# Compile node
yarn compile

# Start node
yarn start
```

## First launch

After first launch the node will create a folder inside `~/.rpp` where you will find the configuration file, based on the `--name` argument you give. If you've followed exactly the guide you'll find a `provider0` folder.

This is what the terminal should show:
```
Working dir is: /home/turinglabs/GIT/PROTOCOL/retriev/provider-cli
Homedir is: /home/turinglabs
Provider name is: provider0
Can't find configs for node provider0, creating.
Generating new identity for node.
New identity is: 0x66Ed08Bd5067D2e1aEA20CB988FA594Db0F4b511
Loaded identity: 0x66Ed08Bd5067D2e1aEA20CB988FA594Db0F4b511
```

As you can see the node created a new identity (aka blockchain address) which will be used as identifier inside the network. You'll find the private key inside the `configs.json` file in the `~/.rpp/provider0` folder. Should be something like:
```
{
    "api_url": "https://api.pldr.dev",
    "pin": true, 
    "max_size": 20000000, 
    "price_strategy": 0,
    "key": "0x1087e6f2fc70ab1a4ecd30b0782c6aaf69c38bf98e719cc618e191ea1e80d386",
    "address": "0x66Ed08Bd5067D2e1aEA20CB988FA594Db0F4b511",
    "provider": "https://goerli.infura.io/v3/YOUR_INFURA_ID",
    "contract_address": "0xBc331A7bEa063DbCE8b3d16F77850B617Bc36cbA"
}
```

Please now create a backup of the `key`, which is stored locally and should not be shared. Of course you can also use another key you previosly created.

## Secure external communications

To be sure anyone can communicate with your node we have to setup a reverse proxy with NGINX and also add an SSL certificate. Please be sure you bought a domain and be sure to create an `A` record inside your `DNS` configuration before continue the guide.

After you linked your domain to your ip address you should be able to setup NGINX follow these simple steps:

```
cd NODE_TYPE-cli
bash secure.sh YOUR_DOMAIN
```

The answer should be something like:
```
BASIC SETUP IS COMPLETE, PLEASE RUN: sudo certbot --nginx -d YOUR_DOMAIN
```

Run now:
```
sudo certbot --nginx -d YOUR_DOMAIN
```

If everything is ok you should be now able to connect your node from the external. You can now open the browser and ask the identity of the node directly using the URL:
```
https://YOUR_DOMAIN/identity
```

For example our demo-provider will answer [here](https://provider.pldr.dev/identity).

## Signup as provider

If you completed this procedure to be included as provider inside the protocol you're now able to signup using the CLI.

Please follow these basic steps, assuming you're in the main project's folder:
```
cd provider-cli
./bin/rpp-provider-linux subscribe https://YOUR_DOMAIN
```
## Tune your SLA

As you may noticed on the config file you have those five parameters:
- `pin`: which defines if your node automatically pin on the default instance or not, it can be `true` or `false` (default is `true`).
- `max_size`: which defines the max size your node will accept, written in `bytes` (defauls is `20000000`).
- `min_price`: which defines the amount of *wei* needed to accept the deal. Minimum amount is defined as the result of `price_strategy` * `file_size_in_bytes` * `duration_of_deal` (default is `0`).
- `max_collateral_multiplier`: which defines the max allowed difference between `value` and `collateral` (default is `1000`).
- `max_duration`: which defines the max duration of the deal written in `days` (default is `365`).

If you want to define your own strategy you can tune directly the `config.json` file or using following commands.
Assuming you're in the main project's folder:
```
cd provider-cli
./bin/rpp-provider-linux setupminprice <AMOUNT_IN_WEI>
./bin/rpp-provider-linux setupmaxsize <MAX_SIZE_IN_BYTE>
./bin/rpp-provider-linux setupmaxduration <MAX_DURATION_IN_DAYS>
./bin/rpp-provider-linux setupmaxcollateral <MAX_COLLATERAL_MULTIPLIER>
./bin/rpp-provider-linux pin <TRUE_OR_FALSE>
```

If you want a recap of your stored configuration you can run this command:

```
./bin/rpp-provider-linux getstrategy
```

When you're ready to publish your strategy on the API you run this commmand and wait for confirmation:

```
./bin/rpp-provider-linux storestrategy
```

# Support

If you need support please feel free to jump into our [Slack](https://filecoinproject.slack.com/archives/C03CJKWP2DR) channel and ask for it.