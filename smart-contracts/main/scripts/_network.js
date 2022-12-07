const fs = require('fs')
const child_process = require('child_process')
const { generate, derive } = require('../libs/address_generator')
let configFile

async function run() {
    try {
        configFile = './configs/hardhat.json'
        const configs = JSON.parse(fs.readFileSync(configFile).toString())

        if (
            configs.network !== undefined &&
            configs.owner_mnemonic !== undefined
        ) {
            // Generating new mnemonic if needed
            if (configs.owner_mnemonic === undefined || configs.owner_mnemonic === "") {
                const generated = await generate()
                console.log('New mnemonic is:', generated)
                configs.owner_mnemonic = generated
                const owner = await derive(configs.owner_mnemonic, 1)
                configs.owner_key = owner.keys[0]
                configs.owner_address = owner.addresses[0]

                // Create 2 providers
                configs.providers = []
                const providers = await derive(configs.owner_mnemonic, 2, 2)
                for (let k in providers.addresses) {
                    configs.providers.push({
                        "key": providers.keys[k],
                        "address": providers.addresses[k],
                        "endpoint": "http://localhost:800" + k
                    })
                }

                // Create 5 referees
                configs.referees = []
                const referees = await derive(configs.owner_mnemonic, 5, 5)
                for (let k in referees.addresses) {
                    configs.referees.push({
                        "key": referees.keys[k],
                        "address": referees.addresses[k],
                        "endpoint": "http://localhost:700" + k
                    })
                }
                // Add owner as default provider
                configs.constructor_arguments = [configs.owner_address]
                fs.writeFileSync(configFile, JSON.stringify(configs, null, 4))
            }
            // Extracting keys from config file
            const { keys } = await derive(configs.owner_mnemonic, 30)
            console.log(keys)
            console.log('Running local network..')
            child_process.execSync(
                'ACCOUNTS="' + keys.join(',') + '" ' +
                'npx hardhat node', { stdio: 'inherit' }
            )
        } else {
            console.log('Config file missing.')
        }
    } catch (e) {
        console.log(e.message)
        process.exit()
    }
}

if (!fs.existsSync('./configs/hardhat.json')) {
    fs.cpSync('./configs/example.json', './configs/hardhat.json')
}
run();