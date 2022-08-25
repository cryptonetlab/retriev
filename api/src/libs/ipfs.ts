import { create } from 'ipfs-core'
import { contract } from "./web3"
import * as Database from "./database"
import * as dotenv from "dotenv"
dotenv.config();

export const run = async () => {
  console.log("Running IPFS node..")
  global['ipfs'] = await create()
  return true
}

export const hash = (buffer) => {
  return new Promise(async (response) => {
    try {
      const calculated = await global['ipfs'].add(buffer, { cidVersion: 1, onlyHash: true })
      response(calculated.cid.toString())
    } catch (e) {
      response(false);
    }
  });
};

export const add = (buffer) => {
  return new Promise(async (response) => {
    try {
      const added = await global['ipfs'].add(buffer, { cidVersion: 1 })
      console.log("[IPFS] Pinning CID:", added.cid.toString())
      response(added.cid.toString())
    } catch (e) {
      response(false);
    }
  });
};

export const unpin = (cid) => {
  return new Promise(async (response) => {
    try {
      console.log("[IPFS] Unpinning CID:", cid)
      const unpinned = await global['ipfs'].pin.rm(cid.replace("ipfs://", ""))
      response(unpinned)
    } catch (e) {
      response(false);
    }
  });
};

export const parseCache = async () => {
  console.log("[IPFS] Processing cache..")
  try {
    const db = new Database.default.Mongo();
    const instance = await contract()
    const proposal_timeout = parseInt((await instance.contract.proposal_timeout()).toString()) * 1000
    const cache = await db.find('cache', { expired: false }, { timestamp: 1 })
    const now = new Date().getTime()
    for (let k in cache) {
      const pinned = cache[k]
      const expiration = pinned.timestamp + proposal_timeout
      if (now >= expiration) {
        console.log("[IPFS] Unpinning because proposal expired: ipfs://", pinned.cid)
        await unpin(pinned.cid)
        await db.update('cache', { _id: pinned._id }, { $set: { expired: true } })
      }
    }
    console.log("[IPFS] Parsing cache finished, restart in 30s")
    setTimeout(function () {
      parseCache()
    }, 30000)
  } catch (e) {
    console.log("[IPFS] Parsing cache errored, retry in 30s")
    setTimeout(function () {
      parseCache()
    }, 30000)
  }
}