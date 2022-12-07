# Protocol Labs - Retriev

Retriev is a Protocol designed by [CryptoNetLab](https://cryptonet.org/) and developed by [YOMI](https://yomi.digital) that allows end users to create retrieval deals with a subset of IPFS providers. It leverages a reliable system of “missed retrieval” penalties that increases the confidence in decentralized storage networks.

If you want to go deeper on how the protocol works please read our [light paper](./PAPER.md).

We have now two active deployments:
- Polygon network at [0xc8834A8b64ad66668B11240Dc12B3EE32bA02c5B](https://polygonscan.com/address/0xc8834A8b64ad66668B11240Dc12B3EE32bA02c5B). 
- Goerli network at [0x29E4E245F47Abd08E52CF55a837b3B5bbd9aE1D0](https://goerli.etherscan.io/address/0x29E4E245F47Abd08E52CF55a837b3B5bbd9aE1D0).

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
- **Status daemon:** is a `Rust` application.
## Project directories

Project is divided by subfolders, any folder contains a different piece of the protocol:
- `shared`: which contains a shared library to bootstrap nodes, dial with web3 and communicate between peers.
- `smart-contracts`: which contains *smart contracts* folders, each folder contains a single contract.
- `clients-cli`: which contains a basic CLI to interact with contract, create deals and appeals.
- `provider-cli`: which contains *provider* logic to accept deals published on-chain and serve deal files.
- `referee-cli`: which contains *referee* logic to ask `providers` if some clients asks for a retrieval.
- `stress-cli`: which contains a tool to test the network over time.
- `status-daemon`: which contains the Rust tool that aggregates stats.
- `docker`: which contains the Docker image and the scripts to build / run the node.
- `api`: which contains a *NodeJS* application that parses the blockchain and serves informations instantly.
- `ui`: which contains a *Frontend* application and website deployed at retriev.org.

# How to install nodes

Installing a node is required *only* if you want to be part of the referee consortium or you want to be a provider. There are very few requirements to run the node, it depends if you want to run it using [Docker](https://www.docker.com/) or you want to build from source using [NodeJS](https://nodejs.org/en/).

Since we're using blockchain you need a web3 provider, in our case we need a `Goerli` or `Polygon` provider and we suggest to signup for a free account at (Infura)[https://infura.io]. Please be sure to have your `API_KEY` (it will be provided by Infura's interface) before can continue following this guide.

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

## Clients CLI

If you're looking for specific documentation to interact with protocol as a client please go [here](./clients-cli/README.md).

## Providers CLI

If you're looking for specific documentation to interact with protocol as a provider please go [here](./provider-cli/README.md).

# Support

If you need support please feel free to jump into our [Slack](https://filecoinproject.slack.com/archives/C03CJKWP2DR) channel and ask for it.
