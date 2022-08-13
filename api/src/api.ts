import { run, add, hash, parseCache } from "./libs/ipfs"
import * as Database from "./libs/database";
import { parseDeals, parseAppeals, parseDeal, parseAppeal, contract, verify, listenEvents } from "./libs/web3";
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import multer from 'multer'
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
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
  run()
  // TODO: Add a timeout which unpins all expired deal proposals
  listenEvents()
  parseDeals()
  parseAppeals()
  parseCache()
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

// Allow providers store strategies
app.post("/strategy", async function (req, res) {
  if (req.body.address !== undefined && req.body.strategy !== undefined && req.body.signature !== undefined) {
    const verified = <any>await verify("Store " + req.body.address + " strategy.", req.body.signature)
    if (verified !== false && verified.toUpperCase() === req.body.address.toUpperCase()) {
      const db = new Database.default.Mongo();
      const provider = await db.find('providers', { address: req.body.address })
      if (provider !== null) {
        await db.update('providers', { address: req.body.address }, { $set: { strategy: req.body.strategy } })
        res.send({ message: "Strategy updated correctly", error: false })
      } else {
        res.send({ message: "You're not subscribed as provider", error: true })
      }
    } else {
      res.send({ message: "Can't verify address", error: true })
    }
  } else {
    res.send({ message: "Malformed request", error: true })
  }
})

// Add signup endpoint
app.post("/upload", upload.single('file'), async function (req, res) {
  if (req.body.address !== undefined) {
    const cid = await hash(req.file.buffer)
    if (cid !== false) {
      const checkDB = await db.find('cache', { cid: cid })
      if (checkDB === null || (checkDB !== null && checkDB.expired !== undefined && checkDB.expired === true)) {
        const added = await add(req.file.buffer)
        await db.insert('cache', {
          cid: cid,
          address: req.body.address,
          timestamp: new Date().getTime(),
          expired: false
        })
        res.send({ cid: added, error: false })
      } else {
        res.send({ message: "CID already pinned.", cid: cid, error: false })
      }
    } else {
      res.send({ message: "Can't add on IPFS, please retry.", error: true })
    }
  } else {
    res.send({ message: "Malformed request", error: true })
  }
})

// Return IPFS identity
app.get("/ipfs-id", async function (req, res) {
  const multiAddrs = await global['ipfs'].swarm.localAddrs()
  res.send(multiAddrs)
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
