const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const deal_index = 1 // Public readme folder

    try {
        const balance1 = await contract.vault(wallet.address)
        console.log("Balance before withdraw is:", balance1)
        const tx = await contract.cancelDealProposal(deal_index)
        await tx.wait()
        console.log('Deal canceled at ' + tx.hash + '!')
        const balance2 = await contract.vault(wallet.address)
        console.log("Balance after withdraw is:", balance2)
    } catch (e) {
        console.log(e)
        console.log('Can\'t create deal, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
