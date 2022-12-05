const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);

    // Setting up providers if not found in config file
    console.log('Creating providers..')
    const { keys, addresses } = await derive(configs.owner_mnemonic, 0, 20)
    let wallet = new ethers.Wallet(keys[0]).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)
    const deal_index = 1
    try {
        // Get prefix from contract
        const prefix = await contract.getPrefix(deal_index)
        // Create hashed version of message
        const message = ethers.utils.arrayify(prefix)
        const hashedMessage = await ethers.utils.hashMessage(message)
        console.log('Hashed message:', hashedMessage)
        // Sign message
        const signature = await wallet.signMessage(message)
        // Run transaction
        const verified = await contract.verifyRefereeSignature(signature, deal_index, wallet.address)
        console.log(verified)
    } catch (e) {
        console.log(e)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
