import fs from 'fs'
import dotenv from 'dotenv'
import minimist from 'minimist'
import { pinDirectoryToWeb3Storage } from './providers/web3storage.js'
// Bootstrap environment
dotenv.config()
const argv = minimist(process.argv.slice(2));

// Force build to relative paths
const index = fs.readFileSync('../dist/index.html').toString()
const fixed = index.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./').replaceAll('img="/', 'img="./');
fs.writeFileSync('../dist/index.html', fixed)

pinDirectoryToWeb3Storage()