const ethJS = require('ethereumjs-wallet')
const bip39 = require('bip39')
const ETH_DERIVATION_PATH = 'm/44\'/60\'/0\'/0'

exports.generate = async function generate() {
    const mnemonic = bip39.generateMnemonic()
    return mnemonic
}

exports.derive = async function derive(mnemonic, amount) {
    const hdwallet = ethJS.hdkey.fromMasterSeed(await bip39.mnemonicToSeed(mnemonic));
    let keys = []
    let addresses = []
    for (let i = 1; i <= amount; i++) {
        const derivePath = hdwallet.derivePath(ETH_DERIVATION_PATH).deriveChild(i);
        const privkey = derivePath.getWallet().getPrivateKeyString();
        const wallet = ethJS.default.fromPrivateKey(Buffer.from(privkey.replace('0x', ''), 'hex'));
        const address = wallet.getAddressString()
        keys.push(privkey)
        addresses.push(address)
    }
    return { keys, addresses }
}
