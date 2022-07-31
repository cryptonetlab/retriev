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

// TODO: Function to read file system and calculate cid

function createdeal(node, nonce) {
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

function makeappeal(node, deal_index) {
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

module.exports = { getidentity, ipfs, createdeal, makeappeal }