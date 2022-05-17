const { ethers, utils } = require("ethers");
const fs = require('fs');

const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
const provider = new ethers.providers.JsonRpcProvider(configs.provider);
let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

const appeal_index = 1
const mode = 'leader'

async function processRounds() {
    const round = await contract.getRound(appeal_index)
    console.log("Round is:", round.toString())
    const leader = await contract.getElectedLeader(appeal_index)
    console.log("Leader is:", leader)
    for (let k in configs.referees) {
        if (mode === 'leader') {
            if (configs.referees[k].address.toUpperCase() === leader.toUpperCase()) {
                console.log('Leader mode found, slashing..')
                const appeal = await contract.appeals(appeal_index)
                console.log("Slashes are:", appeal.slashes.toString())
                if (parseInt(appeal.slashes.toString()) < parseInt(round.toString()) && round.toString() !== "99") {
                    try {
                        const leaderWallet = new ethers.Wallet(configs.referees[k].key).connect(provider)
                        const leaderContract = new ethers.Contract(configs.contract_address, ABI.abi, leaderWallet)
                        const slash = await leaderContract.processAppeal(appeal_index, [], [])
                        console.log('Pending transaction at: ' + slash.hash)
                        await slash.wait()
                        console.log('Successfully slashed at ' + slash.hash)
                        setTimeout(function () {
                            processRounds()
                        }, 20000)
                    } catch (e) {
                        console.log("Can't slash, retry in 5s.")
                        setTimeout(function () {
                            processRounds()
                        }, 5000)
                    }
                } else {
                    console.log('No need to process appeal, already slashed..')
                    setTimeout(function () {
                        processRounds()
                    }, 20000)
                }
            }
        }
    }
    if (round.toString() === "99") {
        console.log('Appeal ended.')
        process.exit()
    }
}

async function main() {
    try {
        const round = await contract.getRound(appeal_index)
        if (round.toString() !== "99") {
            processRounds()
        } else {
            const appeal = await contract.appeals(appeal_index)
            console.log("Appeal closed, slashes are:", appeal.slashes.toString())
            console.log(appeal)
        }
    } catch (e) {
        console.log(e)
        console.log('Can\'t get round, check transaction.')
    }
}

main()
