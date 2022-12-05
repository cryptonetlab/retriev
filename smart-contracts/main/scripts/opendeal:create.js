const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    if (configs.network === "localhost") {
        configs.network = "hardhat"
    }
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider)
    // Create wallet instance with provider's key
    let wallet = new ethers.Wallet(configs.providers[0].key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    // Getting last deal and add a number to IPFS hash, just for test of course.
    const deal_index = await contract.totalDeals()
    let data_uri = 'ipfs://bafkreiggzxkhpj6m6vkzzwvzst4tv6kng3pgma67ukcrzwzyh5b54eben4'
    if (configs.network === "hardhat") {
        console.log("Adding index for test in localhost..")
        data_uri = 'ipfs://bafkreiggzxkhpj6m6vkzzwvzst4tv6kng3pgma67ukcrzwzyh5b54eben4-' + deal_index // Public readme folder
    }
    const min_duration = await contract.min_duration()
    const duration = min_duration; // Duration of the deal
    const collateral = ethers.utils.parseUnits("1", 'gwei') // Setting 0 if you need minimum one
    let appeal_addresses = [wallet.address, configs.owner_address]
    if (configs.appeal_contract !== undefined) {
        console.log("Appeal contract found, using it to route appeals.")
        appeal_addresses = [configs.appeal_contract]
    }
    console.log("Appeal addresses:", appeal_addresses)
    const contract_protected = await contract.contract_protected()
    if (contract_protected) {
        value = "0"
    }
    try {
        console.log("Creating new open deal with URI: " + data_uri)
        const tx = await contract.createDealWithoutProposal(
            data_uri,
            duration,
            appeal_addresses
            , { value: collateral })
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
