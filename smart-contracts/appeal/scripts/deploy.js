const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  let retriev_configs_file
  if (configs.network === "localhost") {
    retriev_configs_file = "hardhat"
  } else {
    retriev_configs_file = configs.network
  }
  const retriev_configs = JSON.parse(fs.readFileSync("../main/configs/" + retriev_configs_file + ".json"))
  console.log('Deploying contract using Retriev at ' + retriev_configs.contract_address + "..")
  const Contract = await hre.ethers.getContractFactory(configs.contract_name);
  const contract = await Contract.deploy(retriev_configs.contract_address);
  console.log('Deploy transaction is: ' + contract.deployTransaction.hash)
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  configs.contract_address = contract.address
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
  // Write address back in main contract
  retriev_configs.appeal_contract = contract.address
  fs.writeFileSync("../main/configs/" + retriev_configs_file + ".json", JSON.stringify(retriev_configs, null, 4))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
