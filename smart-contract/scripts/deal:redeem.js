const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up provider's wallet
    let wallet = new ethers.Wallet(configs.providers[0].key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const deal_index = 1
    
    try {
        const balance1 = await contract.vault(wallet.address)
        console.log("Balance before redeem is:", ethers.utils.formatEther(balance1.toString()))
        const tx = await contract.redeemDeal(deal_index)
        console.log('Pending transaction at: ' + tx.hash)
        await tx.wait()
        console.log('Deal redeemed at ' + tx.hash + '!')
        const balance2 = await contract.vault(wallet.address)
        console.log("Balance after redeem is:", ethers.utils.formatEther(balance2.toString()))
    } catch (e) {
        console.log('Can\'t redeem deal, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
