import axios from "axios";
import * as Database from "./libs/database";
import { contract, verify, parseDeals } from "./libs/web3";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Init express server
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Automatic parsers
parseDeals()
setInterval(function (){
  parseDeals()
}, 60000)

// Default endpoint
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(3000, () => {
  console.log(`Retriev API running.`);
});
