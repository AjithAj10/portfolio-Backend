const express = require("express");
const router = express.Router();
const Binance = require("./Binance");
const imageParser = require("./dataFromImage.js");
const AddCoin = require("./AddCoin");
const Ku_API_KEY = "654cf8e93872490001ce73f3";
const axios = require("axios");
const KuCoin = require("./KuCoin.js");

router.get("/binance/assets", async (req, res) => {
  try {
    const result = await Binance.fetchBinanceAssets();
    let balances = result.filter((balance) => balance.free > 0.1);
    res.send(balances);
  } catch (err) {
    res.send(err);
    console.log("error", err);
  }
});

router.use("/binance/trade", async (req, res) => {
  try {
    const result = await Binance.getLatestTrades(req.body.coin);
    res.send(result);
  } catch (err) {
    res.send(err);
    console.log("error", err);
  }
});

router.use("/imageParser", async (req, res) => {
  let data = await imageParser.extractTextFromImage();
  res.send(data);
});

router.post("/addCoin", async (req, res) => {
  let data = await AddCoin.createCoin(req.body);
  res.send(data);
});
router.delete("/clean/db", async (req, res) => {
  let data = await AddCoin.trunc();
  res.send(data);
});
router.get("/viewCoins", async (req, res) => {
  let data = await AddCoin.viewCoins();
  res.send(data);
});
router.post("/edit/coin", async (req, res) => {
  let data = await AddCoin.createCoin(req.body);
  res.send(data);
});

router.use("/ku/assets", async (req, res) => {
  try {
    let data = await KuCoin.getCoins();
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});

router.use("/ku/trades", async (req, res) => {
  try {
    let data = await KuCoin.getTades();
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});


module.exports = router;
