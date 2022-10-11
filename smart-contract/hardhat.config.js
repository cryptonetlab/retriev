require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

let provider = 'http://localhost:8545'
let hardhatConfigs = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 500
      }
    },
    goerli: {
      url: provider
    },
    rinkeby: {
      url: provider
    },
    ropsten: {
      url: provider
    },
    mumbai: {
      url: provider
    },
    mainnet: {
      url: provider
    },
    polygon: {
      url: provider
    }
  },
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    }
  },
}

if (process.env.ACCOUNTS !== undefined) {
  for (let k in hardhatConfigs.networks) {
    hardhatConfigs.networks[k].accounts = []
    for (let a in process.env.ACCOUNTS.split(',')) {
      if (k === 'hardhat') {
        hardhatConfigs.networks[k].accounts.push({
          privateKey: process.env.ACCOUNTS.split(',')[a],
          balance: "1000000000000000000000"
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
  hardhatConfigs.etherscan = { apiKey: { polygonMumbai: process.env.POLYGONSCAN, polygon: process.env.POLYGONSCAN } }
}

if (process.env.ETHERSCAN !== undefined && process.env.ETHERSCAN !== '' && process.env.POLYGONSCAN === undefined) {
  hardhatConfigs.etherscan = { apiKey: { mainnet: process.env.ETHERSCAN, rinkeby: process.env.ETHERSCAN, ropsten: process.env.ETHERSCAN, goerli: process.env.ETHERSCAN } }
}

module.exports = hardhatConfigs;
