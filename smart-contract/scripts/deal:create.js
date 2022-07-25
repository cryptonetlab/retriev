const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    // Getting last deal and add a number to IPFS hash, just for test of course.
    const deal_index = await contract.totalDeals()

    const value = "100" // Amount to pay for deal in gwei
    const ipfs_providers = [configs.providers[0].address] // First provider in config file
    const deal_uri = 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG-' + deal_index // Public readme folder
    const min_duration = await contract.min_duration()
    const duration = min_duration; // Duration of the deal (2 minutes for test)
    const collateral = ethers.utils.parseUnits(value, 'gwei') // Setting 0 if you need minimum one
    const appeal_addresses = [wallet.address]
    try {
        console.log("Creating new deal with URI: " + deal_uri)
        const tx = await contract.createDealProposal(
            deal_uri,
            duration,
            collateral,
            ipfs_providers,
            appeal_addresses
            , { value: ethers.utils.parseUnits(value, 'gwei') })
        console.log('Pending transaction at: ' + tx.hash)
        await tx.wait()
        console.log('Deal created at ' + tx.hash + '!')
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
