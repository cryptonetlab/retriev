const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  console.log('Deploying render contract..')
  const Contract = await hre.ethers.getContractFactory("TokenRender");
  const contract = await Contract.deploy();
  console.log('Deploy transaction is: ' + contract.deployTransaction.hash)
  await contract.deployed();
  console.log("Render contract deployed at:", contract.address);
  // Fix value in original contract
  const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
  const provider = new ethers.providers.JsonRpcProvider(configs.provider);
  const wallet = new ethers.Wallet(configs.owner_key).connect(provider)
  const dr_contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)
  await dr_contract.tuneAddresses(0, contract.address)
  console.log('Address saved in contract')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
