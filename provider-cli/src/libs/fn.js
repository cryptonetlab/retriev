const axios = require('axios');

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
            const { contract, wallet, ethers } = await node.contract()
            const canAccept = await contract.isProviderInDeal(deal_index, wallet.address)
            if (canAccept) {
                const balance1 = await contract.vault(wallet.address)
                console.log("Balance before accept is:", ethers.utils.formatEther(balance1.toString()))
                const proposal = await contract.deals(deal_index)
                const deposit_needed = proposal.value * 100;
                console.log("Deposit needed is:", ethers.utils.formatEther(deposit_needed.toString()))
                if (balance1 < deposit_needed) {
                    console.log('Need to deposit, not enough balance inside contract..')
                    const tx = await contract.depositToVault({ value: deposit_needed })
                    console.log("Depositing at " + tx.hash)
                    await tx.wait()
                }
                // TODO: Be sure that file exists and i can pin it
                // TODO: Put an hard limit on file dimension
                console.log("Can accept, listed as provider in deal.")
                const tx = await contract.acceptDealProposal(deal_index)
                console.log('Pending transaction at: ' + tx.hash)
                await tx.wait()
                console.log('Deal accepted at ' + tx.hash + '!')
                const balance2 = await contract.vault(wallet.address)
                console.log("Balance after accept is:", ethers.utils.formatEther(balance2.toString()))
                const message = JSON.stringify({
                    deal_index: deal_index,
                    action: "ACCEPTED",
                    txid: tx.hash
                })
                await node.broadcast(message, "message")
                response(true)
            } else {
                console.log("Not a provider in this deal, can't accept.")
                response(true)
            }
        } catch (e) {
            console.log(e)
            console.log('Can\'t accept deal, check transaction.')
            response(false)
        }
    })
}

const daemon = async (node) => {
    console.log("Running provider daemon..")
    const { contract, wallet, ethers } = await node.contract()
    // Parse proposals
    const proposals = await getproposals(node)
    for (let k in proposals) {
        const proposal = proposals[k]
        await processdeal(node, proposal.args.index)
    }
    // Listen for proposal and accept them automatically, just for test
    contract.on("DealProposalCreated", async (deal_index) => {
        console.log("New deal proposal created, processing..")
        await processdeal(node, deal_index)
    })
}

module.exports = { daemon, getidentity, ipfs, sendmessage, deals, withdraw, getbalance }