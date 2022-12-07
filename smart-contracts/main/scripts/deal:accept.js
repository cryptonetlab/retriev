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

    // Working always with last deal
    const deal_index = await contract.totalDeals()

    try {
        const balance1 = await contract.vault(wallet.address)
        console.log("Balance before accept is:", ethers.utils.formatEther(balance1.toString()))
        const proposal = await contract.deals(deal_index)
        const collateral = proposal.collateral
        console.log("Deposit needed is:", ethers.utils.formatEther(collateral.toString()))
        if (balance1 < collateral) {
            console.log('Need to deposit, not enough balance inside contract..')
            const tx = await contract.depositToVault({ value: collateral })
            console.log("Depositing at " + tx.hash)
            await tx.wait()
        }
        const canAccept = await contract.isProviderInDeal(deal_index, wallet.address)
        if (canAccept) {
            console.log("Can accept, listed as provider in deal.")
            const tx = await contract.acceptDealProposal(deal_index)
            console.log('Pending transaction at: ' + tx.hash)
            await tx.wait()
            console.log('Deal accepted at ' + tx.hash + '!')
            const balance2 = await contract.vault(wallet.address)
            console.log("Balance after accept is:", ethers.utils.formatEther(balance2.toString()))
        } else {
            console.log("Not a provider in this deal, can't accept.")
        }
    } catch (e) {
        console.log(e)
        console.log('Can\'t accept deal, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
