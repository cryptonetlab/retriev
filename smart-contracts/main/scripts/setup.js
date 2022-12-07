const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    // Setting up providers if not found in config file
    if (configs.providers === undefined) {
        console.log('Creating providers..')
        let providers = []
        const { keys, addresses } = await derive(configs.owner_mnemonic, 4, 10)
        for (let k = 0; k < 5; k++) {
            providers.push({
                key: keys[k],
                address: addresses[k],
                endpoint: 'http://localhost:800' + k
            })
        }
        configs.providers = providers
        fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
    }

    // Setting up providers if not found in config file
    if (configs.referees === undefined) {
        console.log('Creating referees..')
        let referees = []
        const { keys, addresses } = await derive(configs.owner_mnemonic, 4, 20)
        for (let k = 0; k < 5; k++) {
            referees.push({
                key: keys[k],
                address: addresses[k],
                endpoint: 'http://localhost:700' + k
            })
        }
        configs.referees = referees
        fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
    }


    // Adding providers to contract
    for (let k in configs.providers) {
        console.log('Adding ' + configs.providers[k].address + ' to providers..')
        try {
            const gasPrice = await provider.getGasPrice()
            const tx = await contract.setProviderStatus(configs.providers[k].address, true, configs.providers[k].endpoint, { gasPrice, gasLimit: "5000000" })
            await tx.wait()
            console.log('Provider added at ' + tx.hash + '!')
        } catch (e) {
            console.log(e)
            console.log('Can\'t add provider, check transaction.')
        }
    }

    // Adding referees to contract
    for (let k in configs.referees) {
        console.log('Adding ' + configs.referees[k].address + ' to referees..')
        try {
            const gasPrice = await provider.getGasPrice()
            const tx = await contract.setRefereeStatus(configs.referees[k].address, true, configs.referees[k].endpoint, { gasPrice, gasLimit: "5000000" })
            await tx.wait()
            console.log('Referee added at ' + tx.hash + '!')
        } catch (e) {
            console.log(e)
            console.log('Can\'t add refeeree, check transaction.')
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
