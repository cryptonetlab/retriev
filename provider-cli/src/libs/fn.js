const axios = require('axios');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
let proposalCache = []
let isProcessing = false

const ipfs = (node, ...args) => {
    node.runIpfsNativeCommand(args.join(' '))
}

const ipfsApi = (method, endpoint, arguments) => {
    return new Promise(async response => {
        try {
            setTimeout(function () {
                console.log('IPFS timed out..')
                response(false)
            }, 60000)
            let request = {
                "method": method,
                "url": "http://localhost:5001/api/v0" + endpoint
            }
            if (arguments !== undefined) {
                request.data = arguments
            }
            const res = await axios(request)
            response(res.data)
        } catch (e) {
            console.log(e.message)
            response(false)
        }
    })
}

const getidentity = (node) => {
    console.log(node.returnNodeIdentity())
}

const sendmessage = async (node, ...args) => {
    try {
        const signature = await node.sign(args[1])
        const response = await axios.post(node.returnNodeEndpoint() + '/broadcast', { message: args[1], signature })
        console.log(response.data)
    } catch (e) {
        console.log("Can't communicate with daemon..")
    }
}

const pin = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    if (argv._ !== undefined && argv._.length === 2 && (argv._[1] === 'true' || argv._[1] === 'false')) {
        configs.pin = argv._[1] === 'true' ? true : false
        try {
            fs.writeFileSync(node.nodePath + "/configs.json", JSON.stringify(configs, null, 4))
            console.log("Max size policy changed correctly to:", configs.pin)
        } catch (e) {
            console.log("Can't save file to disk, retry.")
        }
    } else {
        console.log("Please provide a status for automatic pinning.")
        console.log("`Please run pin <TRUE> or <FALSE>`")
    }
}

const setupmaxsize = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    if (argv._ !== undefined && argv._.length === 2 && parseInt(argv._[1]) >= 0) {
        configs.max_size = parseInt(argv._[1])
        try {
            fs.writeFileSync(node.nodePath + "/configs.json", JSON.stringify(configs, null, 4))
            console.log("Max size policy changed correctly to:", configs.max_size)
        } catch (e) {
            console.log("Can't save file to disk, retry.")
        }
    } else {
        console.log("Please provide a maximum size for pinned files.")
        console.log("`Please run setupmaxsize <SIZE>`")
    }
}

const setupmaxcollateral = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    if (argv._ !== undefined && argv._.length === 2 && parseInt(argv._[1]) >= 0) {
        configs.max_collateral_multiplier = parseInt(argv._[1])
        try {
            fs.writeFileSync(node.nodePath + "/configs.json", JSON.stringify(configs, null, 4))
            console.log("Max size policy changed correctly to:", configs.max_collateral_multiplier)
        } catch (e) {
            console.log("Can't save file to disk, retry.")
        }
    } else {
        console.log("Please provide a maximum collateral multiplier, default is 1000.")
        console.log("`Please run setupmaxcollateral <SIZE>`")
    }
}

const setupmaxduration = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    if (argv._ !== undefined && argv._.length === 2 && parseInt(argv._[1]) >= 0) {
        configs.max_duration = parseInt(argv._[1])
        try {
            fs.writeFileSync(node.nodePath + "/configs.json", JSON.stringify(configs, null, 4))
            console.log("Max duration policy changed correctly to:", configs.max_duration)
        } catch (e) {
            console.log("Can't save file to disk, retry.")
        }
    } else {
        console.log("Please provide a maximum duration in day, default is 365.")
        console.log("`Please run setupmaxduration <DAYS>`")
    }
}

const setupminprice = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    if (argv._ !== undefined && argv._.length === 2 && parseInt(argv._[1]) >= 0) {
        configs.min_price = parseInt(argv._[1])
        try {
            fs.writeFileSync(node.nodePath + "/configs.json", JSON.stringify(configs, null, 4))
            console.log("Price policy changed correctly to:", configs.min_price)
        } catch (e) {
            console.log("Can't save file to disk, retry.")
        }
    } else {
        console.log("Please provide a minimum price for retrieval pinning.")
        console.log("`Please run setminprice <PRICE>`")
    }
}

const getstrategy = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    console.log("Min price is:", configs.min_price, 'wei')
    console.log("Max duration is:", configs.max_duration, 'days')
    console.log("Max collateral multiplier is:", configs.max_collateral_multiplier)
}

const storestrategy = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    if (configs.api_url !== undefined) {
        const { wallet } = await node.contract()
        const message = "Store " + wallet.address + " strategy."
        const signature = await node.sign(message)
        console.log('Signature is:', signature)
        console.log('Sending request to api..')
        const update = await axios.post(configs.api_url + '/strategy', {
            strategy: {
                min_price: configs.min_price,
                max_size: configs.max_size,
                max_collateral_multiplier: configs.max_collateral_multiplier,
                max_duration: configs.max_duration,
            },
            endpoint: configs.endpoint,
            address: wallet.address,
            signature: signature
        })
        console.log('Response is:', update.data.message)
    } else {
        console.log('Can\'t signup, API URL is not configured.')
    }
}

const subscribe = async (node) => {
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    if (configs.api_url !== undefined) {
        if (argv._[1] !== undefined && argv._[1].indexOf('https') !== undefined) {
            const message = "Sign me as PLDR provider."
            const signature = await node.sign(message)
            const { wallet } = await node.contract()
            console.log('Signature is:', signature)
            console.log('Sending request to api..')
            const subscription = await axios.post(configs.api_url + '/signup', {
                endpoint: argv._[1],
                address: wallet.address,
                signature: signature
            })
            console.log('Response is:', subscription.data.message)
        } else {
            console.log('You must provide an endpoint where referees and clients will contact you.')
        }
    } else {
        console.log('Can\'t signup, API URL is not configured.')
    }
}

const deals = async (node, ...args) => {
    if (args[1] !== undefined) {
        const deal_command = args[1]
        const { contract, wallet, ethers } = await node.contract()
        const totalDeals = await contract.totalDeals()
        const deals = []
        switch (deal_command) {
            case "list":
                console.log("Asking complete list to blockchain..")
                for (let k = 1; k <= totalDeals; k++) {
                    const owner = await contract.ownerOf(k);
                    console.log("Checking if deal #" + k + " was accepted by current provider..")
                    if (owner === wallet.address) {
                        deals.push(k)
                    }
                }
                console.log('--')
                console.log('List of deals is:')
                console.log(deals)
                break;
            case "pending":
                console.log("Asking complete list to blockchain..")
                for (let k = 1; k <= totalDeals; k++) {
                    console.log("Checking if deal #" + k + " allows provider to accept..")
                    const canAccept = await contract.isProviderInDeal(k, wallet.address)
                    if (canAccept) {
                        const owner = await contract.ownerOf(k);
                        if (owner === '0x0000000000000000000000000000000000000000') {
                            deals.push(k)
                        }
                    }
                }
                console.log('--')
                console.log('List of pending deals is:')
                console.log(deals)
                break;
            case "accept":
                if (args[2] !== undefined) {
                    const deal_index = args[2]
                    const balance = await contract.vault(wallet.address)
                    console.log("Your internal balance is:", ethers.utils.formatEther(balance.toString()))
                    const proposal = await contract.deals(deal_index)
                    const deposit_needed = proposal.value * 100
                    console.log("Deposit needed is:", ethers.utils.formatEther(deposit_needed.toString()))
                    let errored = false
                    if (balance < deposit_needed) {
                        console.log('Need to deposit, not enough balance inside contract..')
                        try {
                            const tx = await contract.depositToVault({ value: deposit_needed })
                            console.log("Depositing at " + tx.hash)
                            await tx.wait()
                        } catch (e) {
                            console.log('--')
                            console.log(e.message)
                            console.log('--')
                            console.log("Can't deposit, please check error logs.")
                            errored = true
                        }
                    }
                    if (!errored) {
                        try {
                            const tx = await contract.acceptDealProposal(deal_index)
                            console.log('Pending transaction at: ' + tx.hash)
                            await tx.wait()
                            console.log('Deal accepted at ' + tx.hash + '!')
                        } catch (e) {
                            console.log('--')
                            console.log(e.message)
                            console.log('--')
                            console.log("Can't accept deal, see error logs.")
                        }
                    }
                } else {
                    console.log("Please provide DEAL_ID first.")
                }
                break;
            case "process":
                if (args[2] !== undefined) {
                    processdeal(node, args[2])
                } else {
                    console.log("Please provide DEAL_ID first.")
                }
                break;
            default:
                console.log("Subcommand not found.")
                break;
        }
    } else {
        console.log("Please provide deal subcommand, examples:")
        console.log("`deals list`: returns the list of accepted deals (including inactive)")
        console.log("`deals pending`: returns the list of pending deals")
        console.log("`deals accept DEAL_ID`: accept provided deal")
    }
}

const withdraw = async (node, ...args) => {
    const { contract, wallet, ethers } = await node.contract()
    const balance = await contract.vault(wallet.address)
    if (balance > 0) {
        console.log("Starting withdraw of " + ethers.utils.formatEther(balance) + " ETH..")
        const tx = await contract.withdrawFromVault(balance)
        console.log('Pending transaction at: ' + tx.hash)
        await tx.wait()
    } else {
        console.log("Nothing to withdraw..")
    }
}

const getbalance = async (node) => {
    const { contract, wallet, ethers } = await node.contract()
    const balance = await contract.vault(wallet.address)
    console.log("Balance is " + ethers.utils.formatEther(balance) + " ETH")
}

const getproposals = async (node) => {
    const { contract, wallet, ethers } = await node.contract()
    const filter = await contract.filters.DealProposalCreated()
    const appealsEvents = await contract.queryFilter(filter)
    return appealsEvents
}

const processdeal = (node, deal_index) => {
    return new Promise(async response => {
        try {
            const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
            const { contract, wallet, ethers } = await node.contract()
            let canAccept = await contract.isProviderInDeal(deal_index, wallet.address)
            if (canAccept) {
                const proposal = await contract.deals(deal_index)
                const proposal_timeout = await contract.proposal_timeout()
                // Check if deal was accepted or expired
                const expires_at = (parseInt(proposal.timestamp_request.toString()) + parseInt(proposal_timeout.toString())) * 1000
                const accepted = parseInt(proposal.timestamp_start.toString()) > 0
                console.log("Deal expires at:", expires_at)
                console.log("Deal accepted?", accepted)
                if (new Date().getTime() < expires_at && !accepted) {
                    let policyMet = false
                    // Retrive the file from IPFS
                    console.log("Retrieving file stats from:", proposal.deal_uri)
                    const file_stats = await ipfsApi("post", "/files/stat?arg=" + proposal.deal_uri.replace("ipfs://", "/ipfs/"))
                    console.log("File stats:", file_stats)
                    if (file_stats !== false && file_stats.Size !== undefined) {
                        if (configs.min_price !== undefined && parseInt(configs.min_price) > 0) {
                            let expected_price = file_stats.Size * parseInt(configs.min_price) * proposal.duration
                            console.log('Expected price in wei is:', expected_price)
                            console.log('Deal value is:', proposal.value.toString())
                            if (parseInt(proposal.value.toString()) >= expected_price) {
                                policyMet = true
                            } else {
                                const message = JSON.stringify({
                                    deal_index: deal_index.toString(),
                                    owner: proposal.owner,
                                    action: "DEAL_UNDERPRICED",
                                    deal_uri: proposal.deal_uri,
                                    timestamp: new Date().getTime()
                                })
                                await node.broadcast(message, "message")
                            }
                        } else {
                            policyMet = true
                        }
                        // Check if collateral is acceptable
                        let slashing_multiplier = await contract.slashing_multiplier()
                        if (configs.max_collateral_multiplier !== undefined) {
                            slashing_multiplier = configs.max_collateral_multiplier
                        }
                        const maximum_collateral = parseInt(slashing_multiplier.toString()) * parseInt(proposal.value.toString());
                        if (parseInt(proposal.collateral.toString()) > maximum_collateral) {
                            console.log("Collateral is too high, can't accept.")
                            const message = JSON.stringify({
                                deal_index: deal_index.toString(),
                                owner: proposal.owner,
                                action: "COLLATERAL_TOO_BIG",
                                deal_uri: proposal.deal_uri,
                                timestamp: new Date().getTime()
                            })
                            await node.broadcast(message, "message")
                            policyMet = false
                        }
                        // Check if file size is lower than accepted one
                        if (policyMet && configs.max_size !== undefined && parseInt(configs.max_size) > 0) {
                            if (parseInt(file_stats.Size) > parseInt(configs.max_size)) {
                                const message = JSON.stringify({
                                    deal_index: deal_index.toString(),
                                    owner: proposal.owner,
                                    action: "FILE_TOO_LARGE",
                                    deal_uri: proposal.deal_uri,
                                    timestamp: new Date().getTime()
                                })
                                await node.broadcast(message, "message")
                                console.log("File is too large, can't accept.")
                                policyMet = false
                            }
                        }
                    } else {
                        const message = JSON.stringify({
                            deal_index: deal_index.toString(),
                            owner: proposal.owner,
                            action: "UNRETRIEVALABLE",
                            deal_uri: proposal.deal_uri,
                            timestamp: new Date().getTime()
                        })
                        await node.broadcast(message, "message")
                        if (proposalCache.indexOf(deal_index) === -1) {
                            console.log('Adding deal in cache for future retrieval')
                            proposalCache.push(deal_index)
                        }
                    }
                    if (policyMet) {
                        const deposited = await contract.vault(wallet.address)
                        console.log("Balance before accept is:", ethers.utils.formatEther(deposited.toString()))
                        const deposit_needed = proposal.value * 100;
                        console.log("Deposit needed is:", ethers.utils.formatEther(deposit_needed.toString()), "ETH")
                        if (deposited < deposit_needed) {
                            try {
                                console.log('Need to deposit, not enough balance inside contract..')
                                const tx = await contract.depositToVault({ value: deposit_needed.toString() })
                                console.log("Depositing at " + tx.hash)
                                await tx.wait()
                            } catch (e) {
                                console.log("Can't deposit..")
                                canAccept = false
                            }
                        }
                        // Be sure provider can accept deal
                        if (canAccept) {
                            console.log("Can accept, listed as provider in deal.")
                            const tx = await contract.acceptDealProposal(deal_index)
                            console.log('Pending transaction at: ' + tx.hash)
                            await tx.wait()
                            console.log('Deal accepted at ' + tx.hash + '!')
                            const balance2 = await contract.vault(wallet.address)
                            console.log("Balance after accept is:", ethers.utils.formatEther(balance2.toString()))
                            const message = JSON.stringify({
                                deal_index: deal_index.toString(),
                                action: "ACCEPTED",
                                owner: proposal.owner,
                                deal_uri: proposal.deal_uri,
                                txid: tx.hash
                            })
                            // Check if pinning mode is active
                            if (configs.pin !== undefined && configs.pin === true) {
                                const pinned = await ipfsApi("post", "/pin/add?arg=" + proposal.deal_uri.replace("ipfs://", "/ipfs/") + '&recursive=true')
                                console.log('Pinning status is:', pinned)
                            }
                            await node.broadcast(message, "message")
                            // Be sure deal is not in cache anymore
                            let temp = []
                            for (let k in proposalCache) {
                                if (proposalCache[k] !== deal_index) {
                                    temp.push(proposalCache[k])
                                }
                            }
                            proposalCache = temp
                            response(true)
                        } else {
                            response(false)
                        }
                    } else {
                        console.log("Policy didn't met, can't accept automatically")
                        response(false)
                    }
                } else {
                    // Be sure deal is not in cache anymore
                    let temp = []
                    for (let k in proposalCache) {
                        if (proposalCache[k] !== deal_index) {
                            temp.push(proposalCache[k])
                        }
                    }
                    console.log("Deal expired or accepted yet, can't accept anymore.")
                    response(false)
                }
            } else {
                console.log("Not a provider in this deal, can't accept.")
                response(false)
            }
        } catch (e) {
            console.log(e)
            console.log('Can\'t accept deal, check transaction.')
            response(false)
        }
    })
}

const processCache = async (node) => {
    if (!isProcessing) {
        if (proposalCache.length > 0) {
            isProcessing = true
            for (let k in proposalCache) {
                await processdeal(node, proposalCache[k])
            }
            isProcessing = false
            console.log("Ending process cache..")
        } else {
            console.log('Cache is empty, nothing to do..')
        }
    }
}

const daemon = async (node) => {
    console.log("Adding cache node to swarm..")
    const configs = JSON.parse(fs.readFileSync(node.nodePath + "/configs.json"))
    const cacheId = await axios.get(configs.api_url + "/ipfs-id")
    console.log("Found those identities for node:", cacheId.data)

    for (let k in cacheId.data) {
        const identity = cacheId.data[k]
        console.log("Adding " + identity + " to swarm")
        await ipfsApi("post", "/swarm/connect?arg=" + identity)
    }

    console.log("Running provider daemon..")
    const { contract, wallet, ethers } = await node.contract()
    // Parse proposals
    const proposals = (await getproposals(node)).reverse()
    for (let k in proposals) {
        const proposal = proposals[k]
        await processdeal(node, proposal.args.index)
    }
    // Parse proposal cache any 60s
    setInterval(function () {
        console.log('Processing cache..')
        processCache(node)
    }, 60000)
    // Listen for proposal and accept them automatically, just for test
    contract.on("DealProposalCreated", async (deal_index) => {
        console.log("New deal proposal created, processing..")
        await processdeal(node, deal_index)
    })
}

module.exports = { daemon, getidentity, ipfs, sendmessage, deals, withdraw, getbalance, subscribe, setupminprice, getstrategy, setupmaxsize, setupmaxduration, setupmaxcollateral, pin, storestrategy }