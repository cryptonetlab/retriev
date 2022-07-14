const axios = require('axios');
let appealsProcessed = []
let appealCache = []
let appealsProcessing = {}
let bootstrapped = []
let processed = {}
const MAX_CONCURRENT_APPEALS = 20
let CONCURRENT_APPEALS = 0

const ipfs = (node, ...args) => {
    node.runIpfsNativeCommand(args.join(' '))
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

const retrievefile = (provider, hash) => {
    return new Promise(async response => {
        try {
            const file = await axios.get(provider + "/ipfs/" + hash)
            // TODO: Performs some other security check on the file, 
            // like hash again the file and check if CID is the same
            response(file.data)
        } catch (e) {
            console.log("Can't retrieve file, error is:", e.message)
            response(false)
        }
    })
}

const processappeal = async (node, index) => {
    // TODO: Here we should add some database to prevent cache flushing at each restart
    if (appealsProcessed.indexOf(index.toString()) === -1) {
        console.log('Processing appeal #' + index + '..')
        const { contract, wallet, ethers } = await node.contract()
        const round = await contract.getRound(index)
        if (round.toString() !== "99") {
            console.log("Processing round:", round.toString())
            const leader = await contract.getElectedLeader(index)
            const appeal = await contract.appeals(index)
            const deal = await contract.deals(appeal.deal_index)
            console.log("Deal is:", deal)
            if (leader.toUpperCase() === wallet.address.toUpperCase()) {
                const ownerOf = await contract.ownerOf(appeal.deal_index)
                console.log("Provider is:", ownerOf)
                const provider = await contract.providers(ownerOf)
                console.log("Asking file to provider at", provider.endpoint)
                const retrieved = await retrievefile(provider.endpoint, deal.ipfs_hash)
                console.log("Processing appeal as leader.")
                if (retrieved === false) {
                    console.log("Slashing provider on-chain for appeal " + index + "..")
                    try {
                        const slash = await contract.processAppeal(appeal.deal_index, [], [])
                        console.log('Pending transactiofn at: ' + slash.hash)
                        await slash.wait()
                        console.log("Provider successfully slashed.")
                        // Sending slashed message to peers
                        const message = JSON.stringify({
                            appeal: index.toString(),
                            action: "SLASHED",
                            received: false,
                            proof: "SOME_KIND_OF_PROOF" // TODO: Add some kind of cryptographical proof to be sure referee received the file
                        })
                        await node.broadcast(message, "slash")
                        appealsProcessed.push(index.toString())
                    } catch (e) {
                        console.log("Can't send on-chain transaction..")
                        console.log("--")
                        console.log(e.message)
                        console.log("--")
                    }
                    // Repeating process
                    console.log("Waiting for 20s, then processing again appeal..")
                    setTimeout(function () {
                        processappeal(node, index)
                    }, 20000)
                } else {
                    console.log("Sending a positive message to other referees..")
                    const message = JSON.stringify({
                        appeal: index.toString(),
                        received: true,
                        proof: "SOME_KIND_OF_PROOF" // TODO: Add some kind of cryptographical proof to be sure referee received the file
                    })
                    await node.broadcast(message, "slash")
                    appealsProcessed.push(index.toString())
                    // Repeating process
                    console.log("Waiting for 20s, then processing again appeal..")
                    setTimeout(function () {
                        processappeal(node, index)
                    }, 20000)
                }
            } else {
                const round_duration = await contract.round_duration()
                const halt_time = (round_duration / 2) * 1000
                console.log("Leader is:", leader, "waiting for " + halt_time + " seconds before try to retrieve file..")
                appealsProcessing[index] = setTimeout(async function () {
                    if (appealsProcessed.indexOf(index.toString()) === -1) {
                        const ownerOf = await contract.ownerOf(appeal.deal_index)
                        console.log("Provider is:", ownerOf)
                        const provider = await contract.providers(ownerOf)
                        console.log("Asking file to provider at", provider.endpoint)
                        const retrieved = await retrievefile(provider.endpoint, deal.ipfs_hash)
                        if (retrieved === false) {
                            const prefix = await contract.getPrefix(index)
                            // Create hashed version of message
                            const message = ethers.utils.arrayify(prefix)
                            const hashedMessage = await ethers.utils.hashMessage(message)
                            console.log('Hashed message:', hashedMessage)
                            // Sign message
                            const signature = await wallet.signMessage(message)
                            // Run double check
                            const verified = await contract.verifyRefereeSignature(signature, index, wallet.address)
                            if (verified) {
                                console.log("Signature verified correctly, broadcasting to other referees..")
                                const message = JSON.stringify({
                                    signature: signature,
                                    appeal: index.toString(),
                                    received: false
                                })
                                await node.broadcast(message, "slash")
                                appealsProcessed.push(index.toString())
                            } else {
                                console.log("Something goes wrong with signature, please check your instance.")
                            }
                            // Repeating process
                            console.log("Waiting for 20s, then processing again appeal..")
                            setTimeout(function () {
                                processappeal(node, index)
                            }, 20000)
                        } else {
                            console.log("Sending a positive message to other referees..")
                            const message = JSON.stringify({
                                appeal: index,
                                received: true,
                                proof: "SOME_KIND_OF_PROOF" // TODO: Add some kind of cryptographical proof to be sure referee received the file
                            })
                            await node.broadcast(message, "slash")
                            appealsProcessed.push(index.toString())
                            // Repeating process
                            console.log("Waiting for 20s, then processing again appeal..")
                            setTimeout(function () {
                                processappeal(node, index)
                            }, 20000)
                        }
                    }
                }, halt_time)
            }
        } else {
            console.log("Appeal #" + index + " terminated, caching.")
            appealsProcessed.push(index.toString())
            CONCURRENT_APPEALS--
        }
    } else {
        console.log("Appeal already processed, ignoring.")
    }
}

const startappeal = async (node, index) => {
    if (CONCURRENT_APPEALS < MAX_CONCURRENT_APPEALS) {
        console.log('Starting appeal #' + index + '..')
        const { contract, wallet, ethers } = await node.contract()
        try {
            await contract.startAppeal(index)
            CONCURRENT_APPEALS++
        } catch (e) {
            console.log(e)
            console.log("Can't start appeal, probably already started..")
        }
    } else {
        console.log("Adding appeal to cache, will pick up later")
        appealCache.push(index)
    }
}

const parseslash = async (node, raw) => {
    try {
        const message = JSON.parse(raw)
        const verified = (await node.verify(message.message, message.signature)).toUpperCase()
        if (global['authorized'].indexOf(verified) !== -1) {
            const slash = JSON.parse(message.message)
            if (processed[slash.appeal] === undefined) {
                processed[slash.appeal] = {}
            }
            const { contract, wallet, ethers } = await node.contract()
            const leader = await contract.getElectedLeader(slash.appeal)
            if (leader.toUpperCase() !== wallet.address.toUpperCase()) {
                const round = await contract.getRound(slash.appeal)
                if (processed[slash.appeal][round] === undefined) {
                    processed[slash.appeal][round] = {
                        processed: true,
                        signatures: []
                    }
                }
                console.log("[SLASH] Received slash message for appeal #" + slash.appeal)
                // Relay again to any connected peer
                node.broadcast(message.message, 'slash')
                const appeal = await contract.appeals(slash.appeal)
                const deal = await contract.deals(appeal.deal_index)
                const leaderDetails = await contract.referees(leader)
                if (slash.received === true) {
                    console.log("Retrieving again the file to check if leader is not corrupted..")
                    // Process positive slash
                    // This means leader found the file so try to retrieve the file from leader to double-check
                    const retrieved = await retrievefile(leaderDetails.endpoint, deal.ipfs_hash)
                    if (retrieved) {
                        console.log("File was retrieved correctly!")
                    } else {
                        // QUESTION: What should we do in that case? Send a slash message to network?
                        console.log("File wasn't retrieved correctly, referee lies!")
                    }
                    appealsProcessed.push(slash.appeal.toString())
                    clearTimeout(appealsProcessing[slash.appeal])
                } else {
                    // Adding signature to collected one
                    if (verified.toUpperCase() === leader.toUpperCase()) {
                        console.log("Received a slash message from leader, don't need to do nothing..")
                        appealsProcessed.push(slash.appeal.toString())
                    } else {
                        if (slash.signature !== undefined) {
                            let sigFound = false
                            console.log("Collecting signature..")
                            for (let f in processed[slash.appeal][round].signatures) {
                                console.log(processed[slash.appeal][round].signatures[f].signature, slash.signature)
                                if (processed[slash.appeal][round].signatures[f].signature === slash.signature) {
                                    sigFound = true
                                }
                            }
                            if (!sigFound) {
                                processed[slash.appeal][round].signatures.push({
                                    signature: slash.signature,
                                    referee: verified
                                })
                            }
                        }
                        const retrieved = await retrievefile(leaderDetails.endpoint, deal.ipfs_hash)
                        if (retrieved) {
                            console.log("File was retrieved correctly!")
                        } else {
                            console.log("File wasn't retrieved correctly, adding signature and try slash!")
                            const prefix = await contract.getPrefix(slash.appeal)
                            // Create hashed version of message
                            const message = ethers.utils.arrayify(prefix)
                            const hashedMessage = await ethers.utils.hashMessage(message)
                            console.log('Hashed message:', hashedMessage)
                            // Sign message
                            const signature = await wallet.signMessage(message)
                            // Run double check
                            const verified = await contract.verifyRefereeSignature(signature, slash.appeal, wallet.address)
                            if (verified) {
                                console.log("Referee signature verified correctly.")
                                processed[slash.appeal][round].signatures.push({
                                    signature: signature,
                                    referee: wallet.address
                                })
                                const threshold = parseInt((await contract.refereeConsensusThreshold()).toString())
                                console.log("Network threshold is:", threshold)
                                let referees_addresses = []
                                let referees_signatures = []
                                let unique = []
                                for (let j in processed[slash.appeal][round].signatures) {
                                    if (unique.indexOf(processed[slash.appeal][round].signatures[j].referee.toLowerCase()) === -1) {
                                        unique.push(processed[slash.appeal][round].signatures[j].referee.toLowerCase())
                                        try {
                                            const verified = await contract.verifyRefereeSignature(processed[slash.appeal][round].signatures[j].signature, slash.appeal, processed[slash.appeal][round].signatures[j].referee.toLowerCase())
                                            console.log("Is signature valid?", verified)
                                            if (verified) {
                                                referees_addresses.push(processed[slash.appeal][round].signatures[j].referee.toLowerCase())
                                                referees_signatures.push(processed[slash.appeal][round].signatures[j].signature)
                                            }
                                        } catch (e) {
                                            console.log("Can't verify signature from:", processed[slash.appeal][round].signatures[j].referee.toLowerCase())
                                        }
                                    }
                                }
                                let parsedSignaturesCount = referees_signatures.length * 100
                                console.log("Collected signatures:", parsedSignaturesCount)
                                if (parsedSignaturesCount >= threshold) {
                                    console.log("Collected enough signatures, trying slash.")
                                    console.log("Slashing provider because leader didn't and collected enough signatures.")
                                    try {
                                        const slashTransaction = await contract.processAppeal(appeal.deal_index, referees_addresses, referees_signatures)
                                        console.log('Pending transaction at: ' + slashTransaction.hash)
                                        await slashTransaction.wait()
                                        console.log("Provider successfully slashed.")
                                        appealsProcessed.push(slash.appeal.toString())
                                    } catch (e) {
                                        console.log("Error while slashing provider, probably round processed yet..")
                                    }
                                } else {
                                    console.log("Don't have enough signatures, can't slash..")
                                }
                            }
                        }
                    }
                }
            } else {
                console.log("Currently leader, can't do nothing.")
            }
        } else {
            console.log('Message from unauthorized source: ' + verified)
        }
    } catch (e) {
        console.log('Can\'t process, error..')
        console.log('--')
        console.log(e)
        console.log('--')
    }
}

const setuplisteners = (node) => {
    console.log("Setting up slash listeners..")
    for (let k in global['clients']) {
        const peer = global['clients'][k]
        if (bootstrapped.indexOf(k) === -1) {
            peer.on('slash', async function (raw) {
                parseslash(node, raw)
            })
        }
    }
    for (let k in global['servers']) {
        const peer = global['servers'][k]
        if (bootstrapped.indexOf(k) === -1 && peer !== undefined) {
            peer.on('slash', async function (raw) {
                parseslash(node, raw)
            })
        }
    }
}

const processcache = (node) => {
    if (appealCache.length > 0) {
        let temp = []
        for (let k in appealCache) {
            const appealIndex = appealCache[k]
            if (CONCURRENT_APPEALS < MAX_CONCURRENT_APPEALS) {
                startappeal(node, appealIndex)
            } else {
                temp.push(appealIndex)
            }
        }
        appealCache = temp
    }
}

const returnappeals = async (node) => {
    const { contract, wallet, ethers } = await node.contract()
    const filter = await contract.filters.AppealCreated()
    const appealsEvents = await contract.queryFilter(filter)
    return appealsEvents
}

const returnappeal = async (node, appealIndex) => {
    const { contract, wallet, ethers } = await node.contract()
    const appeal = await contract.appeals(appealIndex)
    return appeal
}

// Bootstrap referee listeners
async function bootstrap(node) {
    if (Object.keys(global['servers']).length > 0 || Object.keys(global['clients']).length > 0) {
        setuplisteners(node)
    } else {
        console.log("Can't find peers, retrying in 5 seconds..")
        setTimeout(function () {
            bootstrap(node)
        }, 5000)
    }
}

const daemon = async (node) => {
    console.log("Running referee daemon..")
    bootstrap(node)
    const { contract, wallet, ethers } = await node.contract()
    // Process appeals at startup
    const appealsEvents = await returnappeals(node)
    for (let k in appealsEvents) {
        const appealEvent = appealsEvents[k]
        const appealIndex = appealEvent.args.index
        // TODO: Be sure deal is started, if not started startappeal first
        const appeal = await returnappeal(node, appealIndex)
        if (appeal.origin_timestamp > 0) {
            console.log("Appeal #" + appealIndex + " already started, processing..")
            processappeal(node, appealIndex)
        } else {
            console.log("Appeal #" + appealIndex + " not started, starting..")
            startappeal(node, appealIndex)
        }
    }
    // Listen for appeals in contract
    contract.on("AppealCreated", (index) => {
        console.log("New appeal created, processing..")
        startappeal(node, index)
    })
    // Listen for appeals in contract
    contract.on("AppealStarted", (index) => {
        console.log("New appeal started, processing..")
        processappeal(node, index)
    })
    // Setting up timer to flush the cache
    setInterval(function () {
        processcache(node)
    }, 20000)
}

module.exports = { setuplisteners, getidentity, ipfs, sendmessage, withdraw, getbalance, daemon }