const axios = require('axios');

const buildTickerMap = async () => {
  try {
    const response = await axios.get('https://api.coincap.io/v2/assets');
    const assets = response.data.data;

    const tickerMap = {};
    assets.forEach((asset) => {
      const shortTicker = asset.symbol.toLowerCase();
      const fullName = asset.name.toLowerCase();
      tickerMap[shortTicker] = fullName;
    });

    return tickerMap;
  } catch (error) {
    console.error('Error fetching coin data:', error.message);
    return {};
  }
};

const getCoinPriceByShortTicker = async (shortTicker) => {
  const tickerMap = await buildTickerMap();
  const fullTicker = tickerMap[shortTicker.toLowerCase()];

  if (!fullTicker) {
    console.error(`No mapping found for ${shortTicker}.`);
    return;
  }

  try {
    const response = await axios.get(
      `https://api.coincap.io/v2/assets/${fullTicker}`
    );

    if (response.data && response.data.data && response.data.data.priceUsd) {
      const price = response.data.data.priceUsd;
      return price;
    } else {
      console.error(`Unable to retrieve price data for ${fullTicker}.`);
    }
  } catch (error) {
    console.error('Error fetching data from CoinCap:', error.message);
  }
};

// Example: Get the current price of Bitcoin (BTC) using short ticker
module.exports = {getCoinPriceByShortTicker};
