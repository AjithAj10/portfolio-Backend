const API = require('kucoin-node-sdk');

API.init(require('./config'));

const getCoins =  async () => {
    const res = await API.rest.User.Account.getAccountsList();
    let coins = res.data.filter(e => e.balance > 0.01);
    return coins;
}
const getTades = async () => {
    const res = await API.rest.Trade.Fills.getFillsList();
    let trades = res.data.items;
    return trades;  
}
  //const getTimestampRl = await API.rest.Others.getTimestamp();

 
module.exports = {getCoins, getTades};