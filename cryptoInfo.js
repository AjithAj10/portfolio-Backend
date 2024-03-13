const axios = require("axios");

const getAllCoinPrice = async () => {
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": "6f062bb8-49d9-44c3-8011-761de18dc988", // Replace 'YOUR_API_KEY' with your actual API key
        },
        params: {
          start: 1, // Optional: Start of the page of results (default: 1)
          limit: 50, // Optional: Number of results per page (default: 100, max: 5000)
          convert: "USD", // Optional: Convert prices to this currency (default: USD)
        },
      }
    );

    const data = response.data.data; // Array of cryptocurrency objects
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

module.exports = { getAllCoinPrice };
