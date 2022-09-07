import { Web3Storage } from 'web3.storage'
import { getFilesFromPath } from 'web3.storage'

function getAccessToken() {
    return process.env.WEB3STORAGE_KEY
}

function makeStorageClient() {
    return new Web3Storage({ token: getAccessToken() })
}

async function getFiles(path) {
    const files = await getFilesFromPath(path)
    console.log(`read ${files.length} file(s) from ${path}`)
    return files
}

async function storeWithProgress(files) {
    const onRootCidReady = cid => {
        console.log('Uploading files to:', process.env.WEB3STORAGE_ENDPOINT + cid)
    }

    const totalSize = files.map(f => f.size).reduce((a, b) => a + b, 0)
    let uploaded = 0

    const onStoredChunk = size => {
        uploaded += size
        const pct = totalSize / uploaded * 100
        console.log(`Uploading... ${pct.toFixed(2)}% complete`)
    }

    const client = makeStorageClient()
    return client.put(files, { onRootCidReady, onStoredChunk })
}

export const pinDirectoryToWeb3Storage = async () => {
    const raw = await getFiles('../dist/')
    let files = []
    for (let k in raw) {
        let file = raw[k]
        file.name = file.name.replace('/dist/', '/')
        files.push(file)
    }
    const uploaded = storeWithProgress(files)
    return uploaded
} 