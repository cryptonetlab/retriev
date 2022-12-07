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

    const value = "10000" // Depositing 10000 gwei (100gwei * 100 = minimum deposit)

    try {
        const balance1 = await contract.vault(wallet.address)
        console.log("Balance before deposit is:", ethers.utils.formatEther(balance1.toString()))
        const tx = await contract.depositToVault({ value: ethers.utils.parseUnits(value, 'gwei') })
        console.log('Pending transaction at: ' + tx.hash)
        await tx.wait()
        console.log("Funds deposited successfully at", tx.hash)
        const balance2 = await contract.vault(wallet.address)
        console.log("Balance after deposit is:", ethers.utils.formatEther(balance2.toString()))
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
