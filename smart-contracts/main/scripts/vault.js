const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    console.log('Asking for providers balance..')
    if (configs.providers !== undefined) {
        for (let k = 0; k < configs.providers.length; k++) {
            const balance = await contract.vault(configs.providers[k].address)
            console.log('Balance of ' + configs.providers[k].address + ' is:', ethers.utils.formatEther(balance.toString()))
        }
    }
    console.log('--')
    if (configs.referees !== undefined) {
        console.log('Asking for referees balance..')
        for (let k = 0; k < configs.referees.length; k++) {
            const balance = await contract.vault(configs.referees[k].address)
            console.log('Balance of ' + configs.referees[k].address + ' is:', ethers.utils.formatEther(balance.toString()))
        }
    }
    console.log('--')
    console.log('Asking for owner balance..')
    const balanceowner = await contract.vault(configs.owner_address)
    console.log('Balance of ' + configs.owner_address + ' is:', ethers.utils.formatEther(balanceowner.toString()))
    console.log('--')
    console.log('Asking for protocol balance..')
    const balanceprotocol = await contract.vault(configs.constructor_arguments[0])
    console.log('Balance of ' + configs.constructor_arguments[0] + ' is:', ethers.utils.formatEther(balanceprotocol.toString()))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
