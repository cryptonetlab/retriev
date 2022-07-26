const argv = require('minimist')(process.argv.slice(2));
const crypto = require('crypto');
const _ = require('lodash')
const { Web3Storage, File } = require('web3.storage')
const axios = require('axios')

const ipfs = (node, ...args) => {
    node.runIpfsNativeCommand(args.join(' '))
}

const getidentity = (node) => {
    console.log(node.returnNodeIdentity())
}

function createRandomIPFS() {
    return new Promise(response => {
        // Create random bytes
        const bytes = _.random(1, 2048, 0)
        console.log('📝 Creating random document with ' + bytes + ' bytes..')
        crypto.randomBytes(bytes, async (err, buffer) => {
            if (err) {
                // Prints error
                console.log(err);
                return;
            }
            if (process.env.WEB3STORAGE_JWT !== undefined) {
                try {
                    let files = [
                        new File([buffer], 'test-retriev-' + new Date().getTime() + '.txt')
                    ]
                    const client = new Web3Storage({ token: process.env.WEB3STORAGE_JWT })
                    const uploaded = await client.put(files, { wrapWithDirectory: false })
                    response(uploaded)
                } catch (e) {
                    console.log(e)
                    response(false)
                }
            } else {
                console.log('CAN\'T FOUND JWT FOR WEB3STORAGE')
                response(false)
            }
        });
    })
}

function createDeal(node, nonce) {
    return new Promise(async response => {
        const { contract, wallet, ethers } = await node.contract()
        console.log("🔢 Creating deal #" + nonce)
        const ipfs_hash = await createRandomIPFS()
        const deal_uri = "ipfs://" + ipfs_hash
        console.log('🤙 Creating deal with URI:', deal_uri)
        // Setup deal parameters
        const value = "0"
        console.log('💸 Paying ' + value + ' wei for the deal.')
        const ipfs_providers = [process.env.DEFAULT_PROVIDER]
        const min_duration = await contract.min_duration()
        const max_duration = await contract.max_duration()
        const duration = _.random(min_duration, max_duration, 0);
        console.log('⏱️  Random duration of deal is:', duration + '.')
        const collateral = ethers.utils.parseUnits(value, 'gwei')
        const appeal_addresses = [wallet.address]
        try {
            const tx = await contract.createDealProposal(
                deal_uri,
                duration,
                collateral,
                ipfs_providers,
                appeal_addresses
                , { value: ethers.utils.parseUnits(value, 'gwei') })
            console.log('⌛ Pending transaction at: ' + tx.hash)
            await tx.wait()
            console.log('🎉 Deal created at ' + tx.hash + '!')
            response(true)
        } catch (e) {
            console.log('💀 Error while processing transaction..')
        }
    })
}

function makeAppeal(node, deal_index) {
    return new Promise(async response => {
        const { contract, wallet, ethers } = await node.contract()
        console.log("🚩 Making appeal to deal #" + deal_index)
        const can_create_appeal = await contract.canAddressAppeal(deal_index, wallet.address)
        if (can_create_appeal) {
            try {
                const fee = await contract.returnAppealFee(deal_index)
                console.log("Fee for appeal is:", ethers.utils.formatEther(fee.toString()))
                const tx = await contract.createAppeal(deal_index, { value: fee })
                console.log('⌛ Pending transaction at: ' + tx.hash)
                await tx.wait()
                console.log('🎉 Appeal created at ' + tx.hash + '!')
                response(true)
            } catch (e) {
                console.log("💀 Can't create appeal for this deal.")
                response(false)
            }
        } else {
            console.log("💀 Can't create appeals for this deal.")
            response(false)
        }
    })
}

const deals = async (node) => {
    if (argv._.length === 2 && argv._[1] !== undefined && parseInt(argv._[1]) > 0) {
        const ndeals = argv._[1]
        console.log("Creating " + ndeals + " deals.")
        for (let i = 1; i <= ndeals; i++) {
            await createDeal(node, i)
            console.log('--')
        }
    } else {
        console.log("Please provide an amount of deals to create.")
    }
}

const appeals = async (node) => {
    if (argv._.length === 2 && argv._[1] !== undefined && parseInt(argv._[1]) > 0) {
        const nappeals = argv._[1]
        let appealsdone = 0
        const { wallet } = await node.contract()
        console.log('Searching deals for address:', wallet.address)
        const deals = await axios.get(process.env.API_URL + "/deals/" + wallet.address)
        if (deals.data.length >= nappeals) {
            for (let i = 0; i <= deals.data.length; i++) {
                if (appealsdone < nappeals) {
                    let done = await makeAppeal(node, deals.data[i].index)
                    if (done) {
                        appealsdone++
                    }
                    console.log('--')
                }
            }
        } else {
            console.log("Don't have enough deals to create so much appeals, you have " + deals.data.length + " deals.")
        }
    } else {
        console.log("Please provide an amount of appeals to create.")
    }
}

module.exports = { getidentity, ipfs, deals, appeals }