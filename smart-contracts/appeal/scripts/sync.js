const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const appealConfigs = JSON.parse(fs.readFileSync("./configs/example.json").toString())
    const mainConfigs = JSON.parse(fs.readFileSync("../main/configs/hardhat.json").toString())
    appealConfigs.owner_mnemonic = mainConfigs.owner_mnemonic;
    appealConfigs.owner_key = mainConfigs.owner_key;
    appealConfigs.owner_address = mainConfigs.owner_address;
    fs.writeFileSync("./configs/hardhat.json", JSON.stringify(appealConfigs, null, 4))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
