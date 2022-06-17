import { ethers } from "ethers";
import { ABI } from "./abi";
require('dotenv').config()

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

export const parseDeals = () => {
  return new Promise(async (response) => {
    const instance = await contract()
    const totalDeals = await instance.contract.totalDeals()
    console.log("Found " + totalDeals + " deals.");
    for (let k = 0; k <= totalDeals; k++) {
      const onchain_deal = await instance.contract.deals(k);
      console.log(onchain_deal)
      let deal  = {
        index: k,
        timestamp_end: 0,
        timestamp_start: onchain_deal.timestamp_start.toString(),
        duration: onchain_deal.duration.toString(),
        deal_uri: onchain_deal.deal_uri,
        appeal: {}
      }
      console.log(deal)
      deal.index = k;
      deal.timestamp_end = parseInt(deal.timestamp_start) + parseInt(deal.duration);
      const active_appeal = await instance.contract.active_appeals(deal.deal_uri)
      if (active_appeal > 0) {
        console.log("Found appeal for deal, asking details..");
        const appeal = await instance.contract.appeals(active_appeal);
        const round = await instance.contract.getRound(active_appeal);
        appeal.round = round;
        deal.appeal = appeal;
      }
      console.log(deal)
    }
    response(true)
  });
};
