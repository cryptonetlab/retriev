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
                const { addresses, keys } = await derive(configs.owner_mnemonic, 1)
                configs.owner_key = keys[0]
                configs.owner_address = addresses[0]
                fs.writeFileSync(configFile, JSON.stringify(configs, null, 4))
            }
            // Extracting keys from config file
            const { keys } = await derive(configs.owner_mnemonic, 10)
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