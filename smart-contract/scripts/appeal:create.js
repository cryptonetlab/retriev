const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    // Working always with last deal
    const deal_index = await contract.totalDeals()

    try {
        const fee = await contract.returnAppealFee(deal_index)
        console.log("Fee for appeal is:", ethers.utils.formatEther(fee.toString()))
        const tx = await contract.createAppeal(deal_index, { value: fee })
        console.log('Pending transaction at: ' + tx.hash)
        await tx.wait()
        console.log('Appeal successfully created at ' + tx.hash + '!')
        const appeal = await contract.appeals(deal_index)
        console.log("Appeal is:", appeal)
    } catch (e) {
        console.log(e.message)
        console.log('Can\'t create appeal, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
