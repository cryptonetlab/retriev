const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)
    // Scanning al console
    const totalSupply = await contract.totalSupply()
    console.log('TOTAL SUPPLY IS: ' + totalSupply)
    let ended = false
    let i = 1
    let errors = 0
    if (!fs.existsSync('./preview_nft')) {
        fs.mkdirSync('./preview_nft')
    }
    while (!ended) {
        try {
            const provider = await contract.ownerOf(i)
            const uri = await contract.tokenURI(i)
            const deal = await contract.deals(i)
            const proposer = await contract.getProposer(i)
            const owner = await contract.getOwner(i)
            console.log("DEAL:", deal)
            console.log('TOKENID: ' + i, 'PROVIDER IS', provider)
            console.log('OWNER: ' + owner, 'PROPOSER IS', proposer)
            console.log(Buffer.from(uri.split('base64,')[1], 'base64').toString())
            const decodedStr = JSON.parse(Buffer.from(uri.split('base64,')[1], 'base64').toString());
            fs.writeFileSync('./preview_nft/' + i + '.html', '<img width="1300" src="' + decodedStr.image + '" />')
            console.log('--')
            i++
            errors = 0
        } catch (e) {
            if (i === 1) {
                console.log('No tokens found.')
            }
            i++
            errors++
            if (errors > 1) {
                ended = true
            }
        }
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
