import { ethers } from "ethers";
import { ABI } from "./abi";
import * as Database from "./database";
require('dotenv').config()
let isParsingAppeals = false
let isParsingDeals = false

export const verify = (message, signature) => {
  return new Promise(async (response) => {
    const verified = await ethers.utils.verifyMessage(message, signature);
    response(verified);
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

export const parseDeals = async () => {
  if (!isParsingDeals) {
    isParsingDeals = true
    const instance = await contract()
    const totalDeals = await instance.contract.totalDeals()
    console.log("Parsing " + totalDeals + " deals to store informations.");
    const db = new Database.Mongo();
    for (let k = 1; k <= totalDeals; k++) {
      // console.log('Parsing deal #' + k)
      const onchain_deal = await instance.contract.deals(k);
      let deal = {
        index: k,
        timestamp_end: 0,
        timestamp_start: onchain_deal.timestamp_start.toString(),
        duration: onchain_deal.duration.toString(),
        deal_uri: onchain_deal.deal_uri,
        owner: onchain_deal.owner,
        appeal: {}
      }
      deal.index = k;
      deal.timestamp_end = parseInt(deal.timestamp_start) + parseInt(deal.duration);
      const checkDB = await db.find('deals', { index: k })
      if (checkDB === null) {
        await db.insert('deals', deal)
      }
    }
    isParsingDeals = false
  }
};

export const parseAppeals = async () => {
  if (!isParsingAppeals) {
    isParsingAppeals = true
    const instance = await contract()
    const totalDeals = await instance.contract.totalDeals()
    console.log("Parsing " + totalDeals + " deals to search appeals.");
    for (let k = 1; k <= totalDeals; k++) {
      const onchain_deal = await instance.contract.deals(k);
      const active_appeal = await instance.contract.active_appeals(onchain_deal.deal_uri)
      const db = new Database.Mongo();
      if (active_appeal > 0) {
        console.log("Found appeal for deal, asking details..");
        const appeal = await instance.contract.appeals(active_appeal);
        const round = await instance.contract.getRound(active_appeal);
        appeal.round = round;
        console.log(appeal);
        const checkDB = await db.find('deals', { index: k })
        if (checkDB !== null) {
          await db.update('deals', { index: k }, { $set: { appeal: active_appeal } })
        }
      }
    }
    isParsingAppeals = false
  }
};