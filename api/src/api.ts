import { IPFS, create } from 'ipfs-core'
import * as Database from "./libs/database";
import { parseDeals, parseAppeals, parseDeal, parseAppeal, contract, verify, listenEvents } from "./libs/web3";
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
let ipfs
// Init express server
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Init mongo database
const db = new Database.default.Mongo();
db.createDealsIndex();

// Automatic parsers
async function init() {
  console.log("Running IPFS node..")
  ipfs = await create()
  listenEvents()
  parseDeals()
  parseAppeals()
}
init()

// Public endpoints
app.get("/deals/:address", async function (req, res) {
  const db = new Database.default.Mongo();
  const deals = await db.find('deals', { owner: req.params.address }, { timestamp_start: 1 })
  res.send(deals)
})

app.get("/parse/:id", async function (req, res) {
  const deal_id = parseInt(req.params.id)
  console.log('Manual parsing deal #' + deal_id)
  await parseDeal(deal_id)
  console.log('Manual parsing appeal for deal #' + deal_id)
  await parseAppeal(deal_id)
  const db = new Database.default.Mongo();
  const deal = await db.find('deals', { index: deal_id })
  res.send(deal)
})

// Add signup endpoint
app.post("/signup", async function (req, res) {
  if (req.body.address !== undefined && req.body.endpoint !== undefined && req.body.signature !== undefined) {
    const verified = <any>await verify("Sign me as PLDR provider.", req.body.signature)
    if (verified !== false && verified.toUpperCase() === req.body.address.toUpperCase()) {
      const db = new Database.default.Mongo();
      const provider = await db.find('providers', { address: req.body.address })
      if (provider === null) {
        const instance = await contract()
        const tx = await instance.contract.setProviderStatus(req.body.address, true, req.body.endpoint)
        req.body.tx = tx
        await db.insert('providers', req.body)
        res.send({ message: "Provided added correctly", error: false, tx: tx })
      } else {
        res.send({ message: "Provider exists yet", error: true })
      }
    } else {
      res.send({ message: "Can't verify address", error: true })
    }
  } else {
    res.send({ message: "Malformed request", error: true })
  }
})

// Default endpoint
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(3000, () => {
  console.log(`Retriev API running.`);
});
