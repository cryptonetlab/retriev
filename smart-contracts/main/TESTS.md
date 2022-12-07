# Retriev - Smart Contract Testing

Testing on the contract is achieved in two different ways:

- Using Foundry: we use the popular rust tool to create and run tests on main functions and gas reports.
- Using Hardhat: we use hardhat to run a local blockchain and run extended tests.

Automated tests are written in bash, by combining each script we previously wrote. All automated tests are inside `tests` folder, we'll go through them later.

## Tests with Foundry

Test with Foundry are inside the `foundry` folder, which contains the file `Retriev.t.sol` which is the test file itself. To run the tests be sure you have installed [Foundry](https://book.getfoundry.sh). Then you can run our two precompiled tests by calling:

- `yarn foundry:test`: to test all the functions
- `yarn foundry:gasreport`: to export the gas report

## Tests with Hardhat

Tests with Hardhat are a little bit more complicated, to start with testing be sure you have `NodeJS` and `YARN` installed, then proceed with following steps.

### Install dependencies

To install all required dependencies run the `prepare.sh` script from the main folder:

```
bash smart-contracts/prepare.sh
```

Then enter the main folder to start preparing the environment:

```
cd smart-contracts/main
```

### Run local blockchain

To properly test the contract we need a local blockchain running on our machine and we choose Hardhat. You can use also other local networks, just be sure this network produces blocks (default configurations in Hardhat an Truffle doesn't) because some functions are connected to time and blocks.

To run the blockchain simply run:

```
cd smart-contracts/main
yarn network
```

At the first time this will create a new file inside the `configs` folder with fresh keys for all the network so you don't need to create them somewhere else or care about it.

### Run tests

All automated tests are written in `bash` and you can run them on both local, test or main networks because the network is added as parameter of the script. Each time a script is run (on local network) contract will be deployed, so you don't have to care about deploying contracts.

Let's go through all the available tests:

- `bash tests/deploy.sh hardhat`: This is the basic deploy script, it will also setup the network by adding referees and providers to contract.
- `bash tests/deal:proposal.sh hardhat`: This will run a deal proposal flow, simulating a client that requests the storage of a file and the provider that accepts it.
- `bash tests/deal:create.sh hardhat`: This will run a deal without proposal flow, simulating a provider that creates a deal on behalf of an user. 
- `bash tests/deal:create:open.sh hardhat`: This will run a deal without proposal flow and will also deploy the `appeal` contract, which is used to allow anyone appeal to the deal.
- `bash tests/nfts.sh hardhat`: This will test the rendering of the collection to preview NFTs images. 
- `bash tests/vault.sh hardhat`: This will test the vault deposit and withdrawal functions.
- `bash tests/appeal:resolve.sh hardhat`: This will test appeal flow, without slashing the provider, so the provider can withdraw at the end of the deal.
- `bash tests/appeal:slash.sh hardhat`: This will test appeal flow, slashing the provider by using the elected leaders, so the deal is ended and the user refunded.
- `bash tests/appeal:slash_signatures.sh hardhat`: This will test appeal flow, slashing the provider by using the aggregated signatures, so the deal is ended and the user refunded.