const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function tuneProvidersParameters() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up provider's wallet
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const tune = {
        proposal_timeout: { v256: 0, v32: 86400 },
        min_deal_value: { v256: 0, v32: 0 },
        slashing_multiplier: { v256: 1000, v32: 0 },
        min_duration: { v256: 0, v32: 30 },
        max_duration: { v256: 0, v32: 31536000 }
    }

    try {
        let i = 0
        for (let k in tune) {
            console.log("Changing parameter " + k + " to:", tune[k])
            const before = await contract[k]()
            console.log("Value before change is:", before.toString())
            const receipt = await contract.tuneProvidersVariables(i, tune[k].v256, tune[k].v32)
            await receipt.wait()
            console.log(receipt)
            const changed = await contract[k]()
            console.log("Changed value is:", changed.toString())
            i++
        }
    } catch (e) {
        console.log(e)
        console.log('Can\'t tune protocol, check transaction.')
    }
}

async function tuneRefereeParameters() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up provider's wallet
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const tune = {
        committee_divider: { v8: 4, v32: 0 },
        max_appeals: { v8: 5, v32: 0 },
        round_duration: { v8: 0, v32: 10 },
        rounds_limit: { v8: 12, v32: 0 },
        slashes_threshold: { v8: 12, v32: 0 }
    }

    try {
        let i = 0
        for (let k in tune) {
            console.log("Changing parameter " + k + " to:", tune[k])
            const before = await contract[k]()
            console.log("Value before change is:", before.toString())
            const receipt = await contract.tuneRefereesVariables(i, tune[k].v8, tune[k].v32)
            await receipt.wait()
            console.log(receipt)
            const changed = await contract[k]()
            console.log("Changed value is:", changed.toString())
            i++
        }
    } catch (e) {
        console.log(e)
        console.log('Can\'t tune protocol, check transaction.')
    }
}

async function main() {
    await tuneProvidersParameters()
    await tuneRefereeParameters()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
