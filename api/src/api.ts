import axios from "axios";
import * as Database from "./libs/database";
import { parseDeals, parseAppeals } from "./libs/web3";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Init express server
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Init mongo database
const db = new Database.Mongo();
db.createDealsIndex();

// Automatic parsers
parseDeals()
parseAppeals()
setInterval(function () {
  parseDeals()
  parseAppeals()
}, 10000)

// Public endpoints
app.get("/deals/:address", async function (req, res) {
  const db = new Database.Mongo();
  const deals = await db.find('deals', { owner: req.params.address }, { timestamp_start: 1 })
  res.send(deals)
})

// TODO: Add signup endpoint

// Default endpoint
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(3000, () => {
  console.log(`Retriev API running.`);
});
