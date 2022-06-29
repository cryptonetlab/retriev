import fs from 'fs'
import dotenv from 'dotenv'
import minimist from 'minimist'
import { pinDirectoryToPinata } from './providers/pinata.js'
import { pinDirectoryToWeb3Storage } from './providers/web3storage.js'
// Bootstrap environment
dotenv.config()
const argv = minimist(process.argv.slice(2));
let provider = 'pinata'
if (argv._ !== undefined && argv._[0] !== undefined) {
  provider = argv._[0].toLowerCase()
}
console.log('Using provider:', provider)

// Force build to relative paths
const index = fs.readFileSync('../dist/index.html').toString()
const fixed = index.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./').replaceAll('img="/', 'img="./');
fs.writeFileSync('../dist/index.html', fixed)

// Parse provider and be sure exists
if (provider === 'pinata') {
  // Upload to Pinata
  pinDirectoryToPinata()
} else if (provider === 'web3storage') {
  pinDirectoryToWeb3Storage()
} else {
  console.log("Provider don't recognized.")
}