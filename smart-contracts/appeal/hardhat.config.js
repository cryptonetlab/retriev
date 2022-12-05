require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

let provider = 'http://localhost:8545'
let hardhatConfigs = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    rinkeby: {
      url: provider
    },
    ropsten: {
      url: provider
    },
    ethereum: {
      url: provider
    }
  },
  solidity: "0.8.6",
}

if (process.env.ACCOUNTS !== undefined) {
  for (let k in hardhatConfigs.networks) {
    hardhatConfigs.networks[k].accounts = []
    for (let a in process.env.ACCOUNTS.split(',')) {
      if (k === 'hardhat') {
        hardhatConfigs.networks[k].accounts.push({
          privateKey: process.env.ACCOUNTS.split(',')[a],
          balance: "10000000000000000000000000000000000000"
        })
      } else {
        hardhatConfigs.networks[k].accounts.push(process.env.ACCOUNTS.split(',')[a])
      }
    }
  }
}

if (process.env.PROVIDER !== undefined) {
  for (let k in hardhatConfigs.networks) {
    if (k !== 'hardhat') {
      hardhatConfigs.networks[k].url = process.env.PROVIDER
    }
  }
}

if (process.env.POLYGONSCAN !== undefined && process.env.POLYGONSCAN !== '') {
  hardhatConfigs.etherscan = { apiKey: { polygonMumbai: process.env.POLYGONSCAN } }
}

if (process.env.ETHERSCAN !== undefined && process.env.ETHERSCAN !== '') {
  hardhatConfigs.etherscan = { apiKey: { mainnet: process.env.ETHERSCAN, rinkeby: process.env.ETHERSCAN, ropsten: process.env.ETHERSCAN, goerli: process.env.ETHERSCAN } }
}

module.exports = hardhatConfigs;
