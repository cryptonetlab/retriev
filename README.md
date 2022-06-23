# Protocol Labs - Data Retrievability Consortium 

There are 5 folders:
- `shared`: which contains a shared library to bootstrap nodes, dial with web3 and communicate between peers.
- `smart-contract`: which contains *smart contract* logic to create the deals and run the retrieval protocol if the *provider* doesn't provide the file. It will include the indexer too in order to process and store requests.
- `clients-ui`: Minimal UI to interact with contract, create deal and appeals.
- `provider-cli`: which contains *provider* logic to accept deals published on-chain and serve pinned files.
- `referee-cli`: which contains *referee* logic to ask `providers` if some clients asks for a retrieval.

For the description of the protocol see here: https://hackmd.io/@irenegia/retriev

# Use Docker
To use the node you need a `Rinkeby` provider, we suggest to use (Infura)[https://infura.io].
When you have your `PROJECT_ID` you can continue following this guide.

To use docker follow these simple follow steps:

```
# Clone repository
git clone https://github.com/protocol/retriev

# Run first building script
bash docker/scripts/build.sh PROJECT_ID

# Run a node as referee
bash docker/scripts/start.sh referee

# Run a node as provider
bash docker/scripts/start.sh provider

# Stop node
bash docker/scripts/stop.sh
```
