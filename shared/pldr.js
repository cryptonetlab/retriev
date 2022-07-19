const { ethers } = require('ethers')
const fs = require('fs')
const crypto = require('crypto')
const homedir = require('os').homedir()
const { exec, execSync } = require('child_process')
const getIP = require('external-ip')()
const axios = require('axios')
const argv = require('minimist')(process.argv.slice(2));
let mainPath = homedir + '/.pldr'
if (argv.docker !== undefined) {
    mainPath = './pldr'
    console.log('Docker mode active, using relative path.')
}
// Socket.io Server
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const bodyParser = require('body-parser')
const ioServer = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
app.use(bodyParser.json())
// Socket.io Client
const ioClient = require("socket.io-client")
require('dotenv').config()
const ABI = require('./abi')
// Defining node state
global['clients'] = {}
global['servers'] = {}
global['nodes'] = {}
global['feed'] = {}
global['broadcasted'] = []
global['authorized'] = []
module.exports = class PldrNode {
    configs
    nodePath
    port
    peers = []
    constructor(node, port, daemon) {
        this.port = port
        // Check if main folder exists
        if (!fs.existsSync(mainPath)) {
            fs.mkdirSync(mainPath)
        }
        // Check if node folder exists
        this.nodePath = mainPath + '/' + node
        if (!fs.existsSync(this.nodePath)) {
            fs.mkdirSync(this.nodePath)
        }
        // Check if config file exists
        try {
            this.configs = JSON.parse(fs.readFileSync(this.nodePath + '/configs.json'))
        } catch (e) {
            console.log('Can\'t find configs for node ' + node + ', creating.')
        }
        // Generate new identity for node
        if (this.configs === undefined) {
            console.log('Generating new identity for node.')
            const wallet = ethers.Wallet.createRandom()
            console.log('New identity is:', wallet.address)
            this.configs = {
                key: wallet.privateKey,
                address: wallet.address,
                provider: process.env.WEB3_PROVIDER,
                contract_address: process.env.CONTRACT_ADDRESS,
                price_strategy: 0,
                max_size: 20000000
            }
            fs.writeFileSync(this.nodePath + '/configs.json', JSON.stringify(this.configs, null, 4))
        } else {
            console.log('Using configs:', this.configs)
        }

        if (daemon !== undefined && daemon === true) {
            // Handle server connections
            const pldr = this
            ioServer.on('connection', async (socket) => {
                if (socket.handshake.query.identity !== undefined) {
                    let identity = socket.handshake.query.identity.toUpperCase()
                    if (identity !== undefined && global['clients'][identity] === undefined && identity !== this.configs.address) {
                        console.log('-> Client connected: ' + identity)
                        global['clients'][identity] = socket
                        global['nodes'][identity] = identity
                        // Remove peer if disconnected
                        global['clients'][identity].on('disconnect', function () {
                            console.log('Node ' + identity + ' disconnected')
                            global['clients'][identity] = undefined
                            global['nodes'][identity] = undefined
                        })
                        // Relay messages if received by socket
                        global['clients'][identity].on('message', async function (raw) {
                            console.log('[MESSAGE] New message from ' + identity + ': ' + raw)
                            pldr.parse(raw, 'message')
                        })
                    } else if (pldr.configs.address !== identity) {
                        console.log('-> Can\'t connect to ' + identity)
                    }
                }
            })
            server.listen(port, () => {
                console.log('Node listening at *:' + port)
                pldr.bootstrap()
                setTimeout(function () {
                    pldr.api()
                }, 5000)
                setTimeout(function () {
                    pldr.ipfs()
                }, 10000)
            })
        }
    }

    returnPeers() {
        return this.peers
    }

    returnNodeIdentity() {
        return this.configs.address
    }

    returnNodeEndpoint() {
        return 'http://localhost:' + this.port
    }

    returnConfigs() {
        return this.configs
    }

    sign(message) {
        return new Promise(async response => {
            const { wallet } = await this.contract()
            const signed = await wallet.signMessage(message)
            response(signed)
        })
    }

    verify(message, signed) {
        return new Promise(async response => {
            const address = await ethers.utils.verifyMessage(message, signed)
            response(address)
        })
    }

    hash(text) {
        return new Promise(response => {
            let buf = Buffer.from(text)
            var sha = crypto.createHash('sha256').update(buf).digest()
            response(sha.toString('hex'))
        })
    }

    /**
     * P2P Communication functions
     */

    // Return the ip of the node 
    returnPublicIP() {
        return new Promise(async response => {
            getIP((err, ip) => {
                if (err) {
                    response(false)
                }
                response(ip)
            });
        })
    }

    // Bootstrap connections
    async bootstrap() {
        let ip
        try {
            ip = await this.returnPublicIP()
            console.log('Initing at IP: ' + ip)
        } catch (e) {
            console.log('Error while fetching IP')
        }
        await this.getpeers()
        if (this.peers.length > 0) {
            for (let k in this.peers) {
                const peer = this.peers[k]
                global['authorized'].push(peer.identity)
                console.log('Attempting connection to: ' + peer.endpoint)
                this.connect(peer.endpoint, peer.identity)
            }
        } else {
            console.log('WARNING, NO NODES FOUND!')
        }
    }

    // Connnect to server
    async connect(node, identity) {
        const pldr = this
        let socket = ioClient(node, { query: { identity: this.configs.address } })
        socket.on("connect", () => {
            if (global['servers'][identity] === undefined && identity !== this.configs.address) {
                global['servers'][identity] = socket
                console.log('-> Connected to server: ' + identity)
                global['servers'][identity].on('nodes', function (nodelist) {
                    console.log('[NODELIST] Node ' + identity + ' sent nodelist.')
                    nodelist = JSON.parse(nodelist)
                    for (let k in nodelist) {
                        if (global['servers'][identity] === undefined) {
                            console.log('Connecting no previously unkown node: ' + identity)
                            connect(node, k)
                        }
                    }
                })
                // Relay messages if received by socket
                global['servers'][identity].on('message', async function (raw) {
                    console.log('[MESSAGE] New message from ' + identity + ': ' + raw)
                    pldr.parse(raw, 'message')
                })
            }
        })
    }

    // Parse message received from peers
    async parse(raw, protocol) {
        try {
            const message = JSON.parse(raw)
            console.log('Parsed message:', message)
            const verified = (await this.verify(message.message, message.signature)).toUpperCase()
            if (global['authorized'].indexOf(verified) !== -1) {
                if (protocol === 'message') {
                    this.broadcast(message.message)
                }
            } else {
                console.log('Message from unauthorized source: ' + verified)
            }
        } catch (e) {
            console.log('Malformed message..')
        }
    }

    // Broadcast a message to all peers
    async broadcast(message, protocol = 'message') {
        const hash = await this.hash(message)
        const signature = await this.sign(message)
        const toBroadcast = JSON.stringify({ message: message, signature: signature })
        console.log('Checking if message hash ' + hash + ' was broadcasted')
        if (broadcasted.indexOf(hash) === -1) {
            console.log('-> Broadcasting to peers..')
            broadcasted.push(hash)
            if (Object.keys(global['clients']).length > 0) {
                for (let k in global['clients']) {
                    if (global['feed'][k] === undefined) {
                        global['feed'][k] = []
                    }
                    if (global['feed'][k].indexOf(hash) === -1) {
                        global['feed'][k].push(hash)
                        console.log('--> Broadcasting to ' + k)
                        const client = global['clients'][k]
                        if (client !== undefined && client.emit !== undefined) {
                            console.log("---> Emitted successfully to client")
                            client.emit(protocol, toBroadcast)
                        }
                    } else {
                        console.log('--> Yet broadcasted to ' + k)
                    }
                }
            }
            if (Object.keys(global['servers']).length > 0) {
                for (let k in global['servers']) {
                    if (global['feed'][k] === undefined) {
                        global['feed'][k] = []
                    }
                    if (global['feed'][k].indexOf(hash) === -1) {
                        global['feed'][k].push(hash)
                        const server = global['servers'][k]
                        console.log('--> Broadcasting to ' + k)
                        if (server !== undefined && server.emit !== undefined) {
                            console.log("---> Emitted successfully to server")
                            server.emit(protocol, toBroadcast)
                        }
                    } else {
                        console.log('--> Yet broadcasted to ' + k)
                    }
                }
            }
            console.log('-> Broadcast ended.')
        } else {
            console.log('-> Message broadcasted yet!')
        }
    }

    /**
     * IPFS functions
     */
    async ipfs() {
        if (argv.docker === undefined) {
            console.log('Running IPFS daemon..')
            try {
                const ipfs_path = this.nodePath + '/ipfs'
                if (!fs.existsSync(ipfs_path)) {
                    fs.mkdirSync(ipfs_path)
                    console.log("Init IPFS folder at:", ipfs_path)
                    exec('IPFS_PATH=' + ipfs_path + ' ipfs init', { stdio: 'inherit' })
                }
                exec('IPFS_PATH=' + ipfs_path + ' ipfs daemon', { stdio: 'inherit' })
                console.log('IPFS daemon is running correctly..')
            } catch (e) {
                console.log('Can\'t run IPFS daemon, please check your installation.')
            }
        }
    }

    runIpfsNativeCommand(command) {
        const ipfs_path = this.nodePath + '/ipfs'
        console.log('IPFS_PATH=' + ipfs_path + ' ' + command)
        try {
            execSync('IPFS_PATH=' + ipfs_path + ' ' + command, { stdio: 'inherit' })
        } catch (e) {
            console.log("Command failed:")
            console.log("--")
            console.log(e.message)
            console.log("--")
        }
    }

    /**
     * API functions
     */
    api() {
        const pldr = this
        app.get('/identity', async function (req, res) {
            res.send({ address: pldr.configs.address })
        })
        app.post('/broadcast', async function (req, res) {
            const verified = await pldr.verify(req.body.message, req.body.signature)
            if (verified.toUpperCase() === pldr.configs.address.toUpperCase()) {
                pldr.broadcast(req.body.message)
                res.send({ message: "Message broadcasted correctly", error: false })
            } else {
                res.send({ message: "Can't verify signer", signer: verified, owner: pldr.configs.address })
            }
        })
        app.get('/ipfs/:hash', async function (req, res) {
            try {
                // Just for test purposes because deals are done with an invalid CID (Valid+index)
                const hash = req.params.hash.split('-')[0]
                console.log("Downloading file from IPFS: " + hash)
                const file = await axios.post("http://127.0.0.1:5001/api/v0/get?arg=/ipfs/" + hash, { responseType: "arraybuffer" })
                res.set("Content-Type", "application/x-tar")
                res.send(file.data)
                setTimeout(function () {
                    res.status(404).send("FILE_NOT_FOUND")
                }, 30000)
            } catch (e) {
                console.log(e.message)
                res.status(404).send({ message: "Can't fetch file from IPFS" })
            }
        })
    }

    /**
     * Blockchain functions
     */
    async contract() {
        const provider = new ethers.providers.JsonRpcProvider(this.configs.provider)
        const wallet = new ethers.Wallet(this.configs.key).connect(provider)
        const contract = new ethers.Contract(this.configs.contract_address, ABI.abi, wallet)
        return { contract, wallet, provider, ethers }
    }

    async getpeers() {
        let i = 0;
        console.log("Reading peers from blockchain..")
        let ended = false
        const { contract } = await this.contract()
        while (!ended) {
            try {
                const provider = await contract.active_providers(i)
                if (provider.toUpperCase() !== this.configs.address.toUpperCase()) {
                    const details = await contract.providers(provider)
                    if (details.active) {
                        if (details.endpoint.indexOf('https') !== -1) {
                            console.log("Found provider: " + provider, details)
                            this.peers.push({
                                type: 'provider',
                                identity: provider.toUpperCase(),
                                endpoint: details.endpoint
                            });
                        }
                    }
                }
            } catch (e) {
                ended = true;
            }
            i++;
        }
        i = 0
        ended = false
        while (!ended) {
            try {
                const referee = await contract.active_referees(i)
                if (referee.toUpperCase() !== this.configs.address.toUpperCase()) {
                    const details = await contract.referees(referee)
                    if (details.active) {
                        console.log("Found referee: " + referee, details)
                        this.peers.push({
                            type: 'referee',
                            identity: referee.toUpperCase(),
                            endpoint: details.endpoint
                        });
                    }
                }
            } catch (e) {
                ended = true;
            }
            i++;
        }
        console.log("Found " + this.peers.length + " peers.");
        return true;
    }
}