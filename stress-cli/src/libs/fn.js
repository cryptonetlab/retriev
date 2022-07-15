const axios = require('axios');

const ipfs = (node, ...args) => {
    node.runIpfsNativeCommand(args.join(' '))
}

const getidentity = (node) => {
    console.log(node.returnNodeIdentity())
}


module.exports = { getidentity, ipfs}