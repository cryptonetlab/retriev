import { ethers } from "ethers";
import { ABI } from "./abi";
import * as Database from "./database";
import * as dotenv from "dotenv"
import { unpin } from "./ipfs"
import axios from "axios"
dotenv.config();
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
}

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
}

export const parseReferees = async () => {
  if (!isParsingAppeals) {
    isParsingAppeals = true
    const db = new Database.default.Mongo();
    const instance = await contract()
    let i = 0
    let ended = false
    while (!ended) {
      try {
        const referee = await instance.contract.active_referees(i)
        const details = await instance.contract.referees(referee)
        console.log("[REFEREES] Found referee: " + referee)
        const parsed = {
          address: referee,
          active: details.active,
          endpoint: details.endpoint,
          contract: process.env.CONTRACT_ADDRESS
        }
        const checkDB = await db.find('referees', { address: referee })
        if (checkDB === null) {
          console.log("[REFEREES] Insert new referee.")
          await db.insert('referees', parsed)
        } else {
          console.log("[REFEREES] Updating existing referee.")
          await db.update('referees', { address: referee }, { $set: { endpoint: parsed.endpoint, active: parsed.active } })
        }
      } catch (e) {
        ended = true;
      }
      i++;
    }
    return true
  } else {
    return false
  }
}

export const parseDeal = async (deal_index, proposal_tx = '', accept_tx = '', cancel_tx = '') => {
  return new Promise(async response => {
    const instance = await contract()
    console.log('[DEALS] Parsing deal #' + deal_index)
    const db = new Database.default.Mongo();
    const onchain_deal = await instance.contract.deals(deal_index);
    if (parseInt(onchain_deal.timestamp_request.toString()) > 0) {
      let provider = 'NOT_ACCEPTED'
      try {
        provider = await instance.contract.ownerOf(deal_index);
      } catch (e) {
        console.log('[DEALS] -> Deal #', deal_index, 'not accepted yet.')
      }

      console.log('[DEALS] -> Provider is:', provider)
      let appeal_requested = 0
      try {
        appeal_requested = await instance.contract.tot_appeals(deal_index)
      } catch (e) {
        console.log('[DEALS] -> Can\'t get number of requested appeals')
      }

      let deal = {
        identifier: process.env.CONTRACT_ADDRESS + '-' + deal_index,
        index: deal_index,
        timestamp_end: "0",
        timestamp_start: onchain_deal.timestamp_start.toString(),
        timestamp_request: onchain_deal.timestamp_request.toString(),
        duration: onchain_deal.duration.toString(),
        data_uri: onchain_deal.data_uri,
        owner: onchain_deal.owner,
        value: onchain_deal.value.toString(),
        collateral: onchain_deal.collateral.toString(),
        canceled: onchain_deal.canceled,
        provider: provider,
        appeal: {},
        appeal_requested: appeal_requested,
        proposal_tx: proposal_tx,
        contract: process.env.CONTRACT_ADDRESS,
        chain: process.env.CHAIN,
        indexed: false, 
        last_onchain_update: new Date().getTime()
      }
      deal.timestamp_end = (parseInt(deal.timestamp_start) + parseInt(deal.duration)).toString();
      const indexed = await axios.get(process.env.ONCHAIN_API + "/index/" + process.env.PROTOCOL_ID + "/" + deal_index)
      console.log("[INDEX] Onchain response is:", indexed.data)
      const checkDB = await db.find('deals', { index: deal_index, contract: process.env.CONTRACT_ADDRESS })
      if (checkDB === null) {
        console.log('[DEALS] --> Inserting new deal')
        let inserted = false
        while (!inserted) {
          await db.insert('deals', deal)
          const checkDB = await db.find('deals', { index: deal_index, contract: process.env.CONTRACT_ADDRESS })
          if (checkDB !== null) {
            inserted = true
          }
        }
      } else {
        console.log('[DEALS] --> Updating deal')
        if (provider !== 'NOT_ACCEPTED') {
          await unpin(deal.data_uri)
        }
        if (accept_tx === '') {
          accept_tx = checkDB.accept_tx
        }
        if (cancel_tx === '') {
          cancel_tx = checkDB.cancel_tx
        }
        const indexed = await axios.get(process.env.ONCHAIN_API + "/index/" + process.env.PROTOCOL_ID + "/" + deal_index)
        console.log("[INDEX] Onchain response is:", indexed.data)
        await db.update('deals', { index: deal_index, contract: process.env.CONTRACT_ADDRESS }, { $set: { canceled: deal.canceled, timestamp_start: deal.timestamp_start, timestamp_end: deal.timestamp_end, provider: provider, appeal_requested: deal.appeal_requested, accept_tx: accept_tx, cancel_tx: cancel_tx, chain: process.env.CHAIN, last_onchain_update: new Date().getTime() } })
      }
      response(true)
    } else {
      console.log("[DEALS] -> Deal index is not valid")
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
    const db = new Database.default.Mongo();
    for (let k = totalDeals; k >= 1; k--) {
      const deal_index = parseInt(k.toString())
      const checkDB = await db.find('deals', { index: deal_index, contract: process.env.CONTRACT_ADDRESS })
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
}

export const parseAppeal = async (deal_index, origin_tx = '') => {
  return new Promise(async response => {
    const instance = await contract()
    const onchain_deal = await instance.contract.deals(deal_index);
    const active_appeal = await instance.contract.active_appeals(onchain_deal.data_uri)
    const db = new Database.default.Mongo();
    if (active_appeal > 0) {
      console.log("[APPEALS] Found appeal for deal #" + deal_index + ", asking details..");
      try {
        const onchain_appeal = await instance.contract.appeals(active_appeal);
        if (onchain_appeal.deal_index.toString() === deal_index.toString()) {
          let appeal = {
            round: 0,
            active: onchain_appeal.active,
            slashes: onchain_appeal.slashes.toString(),
            origin_timestamp: onchain_appeal.origin_timestamp.toString(),
            slashed: false,
            appeal_index: active_appeal,
            origin_tx: origin_tx
          }
          const round = await instance.contract.getRound(active_appeal);
          console.log("[APPEALS] --> Round is:", round.toString())
          appeal.round = parseInt(round.toString());
          if (appeal.round === 12 && parseInt(appeal.slashes) === 12) {
            appeal.slashed = true
          }
          const checkDB = await db.find('deals', { index: deal_index, contract: process.env.CONTRACT_ADDRESS })
          if (checkDB !== null) {
            console.log('[APPEALS] ---> Saving appeal details to db')
            await db.update('deals', { index: deal_index, contract: process.env.CONTRACT_ADDRESS }, { $set: { appeal: appeal } })
            response(true)
          } else {
            response(false)
          }
        } else {
          response(false)
        }
      } catch (e) {
        console.log('-> Error while parsing appeal.')
        response(false)
      }
    } else {
      console.log('[APPEALS] No appeals found for id #', deal_index)
      response(false)
    }
  })
}

export const parseAppeals = async () => {
  if (!isParsingAppeals) {
    isParsingAppeals = true
    const db = new Database.default.Mongo();
    const deals = await db.find('deals', { contract: process.env.CONTRACT_ADDRESS }, { timestamp_start: -1 })
    for (let k in deals) {
      const deal = deals[k]
      const now = new Date().getTime() / 1000
      const expires_in = parseInt(deal.timestamp_end) - now
      if (expires_in > 0) {
        console.log('[APPEALS] Parsing deal ' + deal.index + ' to search appeals..')
        await parseAppeal(deal.index)
      } else {
        console.log('[APPEALS] Deal ' + deal.index + ' expired.')
      }
    }
    isParsingAppeals = false
    return true
  } else {
    return false
  }
}

export const listenEvents = async () => {
  const instance = await contract()
  console.log('Setting up on-chain event listeners..')
  instance.contract.on("Transfer", async (from, to, index, event) => {
    console.log('[EVENT] New provider', from, 'to', to)
    if (from === "0x0000000000000000000000000000000000000000") {
      console.log("[EVENT] Deal proposal accepted")
      const deal_index = parseInt(index.toString())
      parseDeal(deal_index, '', event.transactionHash)
    }
  })
  instance.contract.on("DealProposalCreated", async (index, providers, data_uri, appeal_addresses, event) => {
    console.log("[EVENT] Deal proposal created")
    const deal_index = parseInt(index.toString())
    parseDeal(deal_index, event.transactionHash)
  })
  instance.contract.on("DealProposalCanceled", async (index, event) => {
    console.log("[EVENT] Deal proposal canceled")
    const deal_index = parseInt(index.toString())
    parseDeal(deal_index, '', '', event.transactionHash)
  })
  instance.contract.on("AppealCreated", async (appeal_index, provider, data_uri, event) => {
    console.log("[EVENT] Appeal created")
    const appeal = await instance.contract.appeals(appeal_index)
    const deal_index = parseInt(appeal.deal_index.toString())
    setTimeout(async function () {
      await parseDeal(deal_index)
      parseAppeal(deal_index, event.transactionHash)
    }, 5000)
    const round_duration = await instance.contract.round_duration()
    const halt_time = (round_duration / 2) * 1000
    let parserInterval = setInterval(async function () {
      const round = await instance.contract.getRound(appeal_index)
      // Store appeal informations
      console.log('[APPEAL] Parsing round #' + round.toString() + ' of appeal #' + appeal_index.toString())
      await parseDeal(deal_index)
      parseAppeal(deal_index)
      // Clear interval because last round was processed
      if (round.toString() === "99") {
        console.log('[APPEAL] Appeal #' + appeal_index.toString() + ' ended')
        clearInterval(parserInterval)
      }
    }, halt_time)
  })
  instance.contract.on("RoundSlashed", async (appeal_index) => {
    console.log("[EVENT] Round slashed")
    const appeal = await instance.contract.appeals(appeal_index)
    const deal_index = parseInt(appeal.deal_index.toString())
    await parseDeal(deal_index)
    parseAppeal(deal_index)
  })
  instance.contract.on("DealInvalidated", async (index) => {
    console.log("[EVENT] Deal invalidated")
    const deal_index = parseInt(index.toString())
    await parseDeal(deal_index)
    parseAppeal(deal_index)
  })
}