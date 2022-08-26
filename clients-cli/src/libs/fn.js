const argv = require('minimist')(process.argv.slice(2), { string: ['provider', 'appealaddress'] });
const _ = require('lodash')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')

const getidentity = (node) => {
    console.log(node.returnNodeIdentity())
}

const deals = async (node) => {
    const { wallet } = await node.contract()
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    console.log('Asking deals to API..')
    try {
        let deals = []
        const dealsApi = await axios.get(configs.api_url + '/deals/' + wallet.address)
        console.log('Found ' + dealsApi.data.length + ' deals.')
        for (let k in dealsApi.data) {
            deals.push({
                dealIndex: dealsApi.data[k].index,
                dealUri: dealsApi.data[k].deal_uri,
                value: dealsApi.data[k].value,
                provider: dealsApi.data[k].provider,
                start_at: new Date(dealsApi.data[k].timestamp_start * 1000),
                end_at: new Date(dealsApi.data[k].timestamp_end * 1000)
            })
        }
        console.table(deals)
    } catch (e) {
        console.log("Error while getting deals from API.")
    }
}

function createdeal(node) {
    return new Promise(async response => {
        const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
        if ((argv.dealuri !== undefined || argv.file !== undefined) && argv.provider !== undefined && argv.duration !== undefined) {
            let deal_uri = argv.dealuri
            // TODO: Handle multi provider case
            let providers = [argv.provider]
            let providerStrategy = {}
            let duration = argv.duration
            let value = argv.value
            let collateral = argv.collateral
            let appeal_addresses = argv.appealaddress?.split(',')
            console.log("💽 Checking if provider is valid..")
            // Check if all providers addresses exists
            const providersApi = await axios.get(configs.api_url + '/providers')
            let found = false
            for (let j in providersApi.data) {
                // TODO: Handle multi provider case
                if (providersApi.data[j].address.toUpperCase() === providers[0].toUpperCase()) {
                    found = true
                    providerStrategy = providersApi.data[j].strategy
                }
            }
            if (!found) {
                console.log("Provider " + providers + " is invalid, please check the address.")
                process.exit()
            }
            const { contract, wallet, ethers, provider } = await node.contract()
            console.log('📝 Reading state from contract..')
            // Get protocol's min and max duration
            const min_duration = parseInt((await contract.min_duration()).toString())
            const max_duration = parseInt((await contract.max_duration()).toString())
            console.log('💳 Creating deal from address:', wallet.address)
            // Check if duration complains protocol and provider
            console.log('⏱️  Deal duration is:', duration + ' days.')
            duration = duration * 60 * 60 * 24
            if (duration > max_duration || duration < min_duration) {
                console.log("Duration is out of range.")
                process.exit()
            }
            // Check if appeal address was setted up correctly
            if (appeal_addresses === undefined) {
                appeal_addresses = [wallet.address]
            }
            // Check if price was defined by user
            if (argv.file !== undefined) {
                try {
                    const file = fs.readFileSync(argv.file)
                    const file_size = Buffer.byteLength(file)
                    console.log("💾 File size is:", file_size + ' byte')
                    console.log("☁️  Uploading file to cache node..")
                    const form_data = new FormData();
                    form_data.append("file", fs.createReadStream(argv.file));
                    form_data.append("address", wallet.address);
                    const uploaded = await axios({
                        method: "post",
                        url: configs.api_url + '/upload',
                        headers: {
                            "Content-Type": "multipart/form-data;boundary=" + form_data.getBoundary()
                        },
                        data: form_data
                    });
                    deal_uri = 'ipfs://' + uploaded.data.cid
                    console.log('🤙 Creating deal with URI:', deal_uri)
                    value = file_size * duration * parseInt(providerStrategy.min_price)
                    collateral = value
                } catch (e) {
                    console.log(e)
                    console.log("Error while uploading file, retry.")
                    process.exit()
                }
            } else {
                console.log('🤙 Creating deal with URI:', deal_uri)
            }
            if (deal_uri !== undefined) {
                console.log('💸 Paying ' + value + ' wei for the deal.')
                const balance = await provider.getBalance(wallet.address)
                console.log("💰 Wallet's balance is:", balance.toString(), 'wei')
                // Create deal proposal
                if (parseInt(balance.toString()) > 0 && parseInt(balance.toString()) >= value) {
                    try {
                        let tx
                        if (parseInt(value) > 0) {
                            tx = await contract.createDealProposal(
                                deal_uri,
                                duration,
                                collateral,
                                providers,
                                appeal_addresses
                                , { value: value.toString() })
                        } else {
                            tx = await contract.createDealProposal(
                                deal_uri,
                                duration,
                                collateral,
                                providers,
                                appeal_addresses)
                        }
                        console.log('⌛ Pending transaction at: ' + tx.hash)
                        await tx.wait()
                        console.log('🎉 Deal created at ' + tx.hash + '!')
                        response(true)
                    } catch (e) {
                        console.log(e.message)
                        console.log('💀 Error while processing transaction..')
                    }
                } else {
                    console.log("💀 Not enough funds to run transaction.")
                }
            } else {
                console.log("💀 Deal URI is undefined, please check.")
            }
        } else {
            console.log('Please provide all required arguments running command using basic mode like:')
            console.log('createdeal --file=<PATH_TO_LOCAL_FILE> --provider=<PROVIDER_ADDRESS> --duration=<DURATION>')
            console.log('')
            console.log('Or use expert mode like:')
            console.log('createdeal --dealuri=<DEAL_URI> --provider=<PROVIDER_ADDRESS> --duration=<DURATION> --value=<DEAL_VALUE> --collateral=<COLLATERAL_IN_WEI> --appealaddress=<APPEAL_ADDRESSES_SEPARATED_BY_COMMA>')
        }
    })
}

function makeappeal(node) {
    return new Promise(async response => {
        let deal_index = argv._[1]
        if (deal_index !== undefined) {
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
        } else {
            console.log("Please provide a deal index.")
        }
    })
}

module.exports = { getidentity, createdeal, deals, makeappeal }