const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up provider's wallet
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const tune = {
        token_render: { address: configs.token_render, state: false },
        protocol_address: { address: configs.protocol_address, state: false },
        contract_protected: { address: "0x0000000000000000000000000000000000000000", state: true },
        permissioned_providers: { address: "0x0000000000000000000000000000000000000000", state: false },
    }

    try {
        let i = 0
        for (let k in tune) {
            console.log("Changing parameter " + k + " to:", tune[k])
            if (k > 0) {
                const before = await contract[k]()
                console.log("Value before change is:", before.toString())
            }
            const receipt = await contract.tuneProtocolVariables(i, tune[k].address, tune[k].state)
            await receipt.wait()
            console.log(receipt)
            if (k > 0) {
                const changed = await contract[k]()
                console.log("Changed value is:", changed.toString())
            }
            i++
        }
    } catch (e) {
        console.log(e)
        console.log('Can\'t tune protocol, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
