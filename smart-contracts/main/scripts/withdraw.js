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

    try {
        const vault1 = await contract.vault(wallet.address)
        console.log("Internal balance before withdraw is:", vault1.toString())
        if (vault1 > 0) {
            const balance1 = await wallet.getBalance()
            console.log("Balance before withdraw is:", balance1.toString())
            const tx = await contract.withdrawFromVault(vault1)
            console.log('Pending transaction at: ' + tx.hash)
            await tx.wait()
            console.log("Funds withdraw successfully at", tx.hash)
            const balance2 = await wallet.getBalance()
            console.log("Balance after withdraw is:", balance2.toString())
            const vault2 = await contract.vault(wallet.address)
            console.log("Internal balance after withdraw is:", vault2.toString())
        } else {
            console.log("Nothing to withdraw!")
        }
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
