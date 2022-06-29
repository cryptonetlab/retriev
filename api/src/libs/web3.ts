import { ethers } from "ethers";
import { ABI } from "./abi";
import * as Database from "./database";
require('dotenv').config()
let isParsingAppeals = false
let isParsingDeals = false

export const verify = (message, signature) => {
  return new Promise(async (response) => {
    try {
      const verified = await ethers.utils.verifyMessage(message, signature);
      response(verified);
    } catch (e) {
      response(false);
    }
  });
};

export const contract = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
  const wallet = new ethers.Wallet(process.env.DUMMY_KEY ?? "").connect(
    provider
  );
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS ?? "",
    ABI,
    wallet
  );
  return { contract, wallet, provider, ethers };
};

export const parseDeal = async (deal_index) => {
  return new Promise(async response => {
    const instance = await contract()
    console.log('[DEALS] Parsing deal #' + deal_index)
    const db = new Database.Mongo();
    const onchain_deal = await instance.contract.deals(deal_index);
    try {
      const owner = await instance.contract.ownerOf(deal_index);
      console.log('[DEALS] -> Owner is:', owner)
      let deal = {
        index: deal_index,
        timestamp_end: "0",
        timestamp_start: onchain_deal.timestamp_start.toString(),
        timestamp_request: onchain_deal.timestamp_request.toString(),
        duration: onchain_deal.duration.toString(),
        deal_uri: onchain_deal.deal_uri,
        owner: onchain_deal.owner,
        value: onchain_deal.value.toString(),
        collateral: onchain_deal.collateral.toString(),
        canceled: onchain_deal.canceled,
        provider: owner,
        appeal: {}
      }
      deal.timestamp_end = (parseInt(deal.timestamp_start) + parseInt(deal.duration)).toString();
      const checkDB = await db.find('deals', { index: deal_index })
      if (checkDB === null) {
        console.log('[DEALS] --> Inserting new deal')
        await db.insert('deals', deal)
      } else {
        console.log('[DEALS] --> Updating deal')
        await db.update('deals', { index: deal_index }, { $set: { canceled: deal.canceled, timestamp_start: deal.timestamp_start, timestamp_end: deal.timestamp_end, provider: deal.provider } })
      }
      response(true)
    } catch (e) {
      console.log('[DEALS] -> Error while parsing deal #', deal_index)
      response(false)
    }
  })
}

export const parseDeals = async () => {
  if (!isParsingDeals) {
    isParsingDeals = true
    const instance = await contract()
    const totalDeals = await instance.contract.totalDeals()
    console.log("[DEALS] -> Parsing " + totalDeals + " deals to store informations.");
    const db = new Database.Mongo();
    for (let k = totalDeals; k >= 1; k--) {
      const deal_index = parseInt(k.toString())
      const checkDB = await db.find('deals', { index: deal_index })
      if (checkDB === null) {
        await parseDeal(deal_index)
      } else if (checkDB.canceled === false) {
        const now = new Date().getTime() / 1000
        const expires_in = parseInt(checkDB.timestamp_end) - now
        if (expires_in > 0 || parseInt(checkDB.timestamp_start) < now) {
          await parseDeal(deal_index)
        } else {
          console.log('[DEALS] --> Deal expired')
        }
      }
    }
    isParsingDeals = false
    return true
  } else {
    return false
  }
};

export const parseAppeal = async (k) => {
  return new Promise(async response => {
    const instance = await contract()
    const onchain_deal = await instance.contract.deals(k);
    const active_appeal = await instance.contract.active_appeals(onchain_deal.deal_uri)
    const db = new Database.Mongo();
    if (active_appeal > 0) {
      console.log("[APPEALS] Found appeal for deal #" + k + ", asking details..");
      try {
        const onchain_appeal = await instance.contract.appeals(active_appeal);
        if (onchain_appeal.deal_index.toString() === k.toString()) {
          let appeal = {
            round: 0,
            active: onchain_appeal.active,
            slashes: onchain_appeal.slashes.toString(),
            origin_timestamp: onchain_appeal.origin_timestamp.toString()
          }
          const round = await instance.contract.getRound(active_appeal);
          console.log("[APPEALS] --> Round is:", round.toString())
          appeal.round = round.toString();
          const checkDB = await db.find('deals', { index: k })
          if (checkDB !== null) {
            console.log('[APPEALS] ---> Saving appeal details to db')
            await db.update('deals', { index: k }, { $set: { appeal: appeal } })
          }
        }
        response(true)
      } catch (e) {
        console.log('-> Error while parsing appeal.')
        response(false)
      }
    } else {
      console.log('[APPEALS] No appeals found for id #', k)
      response(false)
    }
  })
}

export const parseAppeals = async () => {
  if (!isParsingAppeals) {
    isParsingAppeals = true
    const instance = await contract()
    const db = new Database.Mongo();
    const deals = await db.find('deals', {}, { timestamp_start: -1 })
    for (let k in deals) {
      const deal = deals[k]
      const now = new Date().getTime() / 1000
      const expires_in = parseInt(deal.timestamp_end) - now
      if (expires_in > 0) {
        console.log('[APPEALS] Parsing deal ' + deal.index + ' to search appeals..')
        await parseAppeal(deal.index)
      } else {
        console.log('[APPEALS] Deal ' + deal.index + ' elapsed.')
      }
    }
    isParsingAppeals = false
    return true
  } else {
    return false
  }
};