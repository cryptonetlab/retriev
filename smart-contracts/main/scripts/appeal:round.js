const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const appeal_index = 1

    try {
        const round_duration = await contract.round_duration()
        const timeout_time = parseInt(round_duration.toString()) / 2 * 1000
        const round = await contract.getRound(appeal_index)
        console.log("Round is:", round.toString())
        const leader = await contract.getElectedLeader(appeal_index)
        console.log("Leader is:", leader)
        console.log("Waiting " + timeout_time + " seconds before checking again the round.")
        setInterval(async function () {
            const round = await contract.getRound(appeal_index)
            console.log("Round is:", round.toString())
            const leader = await contract.getElectedLeader(appeal_index)
            console.log("Leader is:", leader)
            if (round.toString() === "99") {
                console.log("Appeal ended, exiting process.")
                process.exit()
            }
        }, timeout_time);
    } catch (e) {
        console.log(e)
        console.log('Can\'t get round, check transaction.')
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
