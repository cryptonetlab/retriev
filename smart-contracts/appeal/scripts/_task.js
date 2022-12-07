const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')
const child_process = require('child_process')
const { generate, derive } = require('../libs/address_generator')
let configFile
let scriptFile

async function run() {
    try {
        configFile = './configs/' + argv._[1] + '.json'
        const configs = JSON.parse(fs.readFileSync(configFile).toString())
        const { addresses, keys } = await derive(configs.owner_mnemonic, 10)
        console.log('Deployer address: ' + addresses[0])

        if (
            configs.network !== undefined &&
            configs.owner_mnemonic !== undefined
        ) {
            child_process.execSync(
                'PROVIDER="' + configs.provider + '" ' +
                'ACCOUNTS="' + keys + '" ' +
                'CONFIG="' + configFile + '" ' +
                ' npx hardhat --network ' + configs.network +
                ' run ' + scriptFile, { stdio: 'inherit' }
            )
            console.log('All done, exiting!')
            process.exit();
        } else {
            console.log('Config file missing.')
        }
    } catch (e) {
        console.log(e.message)
        process.exit()
    }
}

if (argv._ !== undefined && argv._.length == 2) {
    if (fs.existsSync('./scripts/' + argv._[0] + '.js')) {
        scriptFile = './scripts/' + argv._[0] + '.js'
        run();
    } else {
        console.log('Can\'t find task: ' + './scripts/' + argv._[0] + '.js')
    }
} else {
    console.log('Can\'r run task, please use script like `yarn task deploy localhost`.')
}