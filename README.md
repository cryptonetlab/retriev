# Protocol Labs - Data Retrievability Consortium MVP

This is a minimal MVP based on "Data Retrievability Constortium" protocol.

There are 5 folders:
- `shared`: which contains a shared library to bootstrap nodes, dial with web3 and communicate between peers.
- `smart-contract`: which contains *smart contract* logic to create the deals and run the retrieval protocol if the *provider* doesn't provide the file. It will include the indexer too in order to process and store requests.
- `clients-ui`: Minimal UI to interact with contract, create deal and appeals.
- `provider-cli`: which contains *provider* logic to accept deals published on-chain and serve pinned files.
- `referee-cli`: which contains *referee* logic to ask `providers` if some clients asks for a retrieval.




For the description of the MVP protocol see here: https://pl-strflt.notion.site/Data-Retrievability-Oracle-252f52f47b3944e8a54e8d0f553c5cd7
