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
  const retriev = new ethers.Contract(configs.contract_address, ABI.abi, wallet)
  const gasPrice = await provider.getGasPrice()
  const tuneTx = await retriev.tuneProtocolVariables(0, contract.address, true, { gasPrice })
  console.log('Address saved in contract at:', tuneTx.hash)
  configs.token_render = contract.address
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
