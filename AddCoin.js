const coinModel = require("./Models/coins");
const { getLatestTrades } = require("./Binance");
const { getTades } = require("./KuCoin");
const cryptoPrice = require("./cryptoInfo");
async function createCoin({
  name,
  avgBuyAmount,
  quantity,
  investedAmount,
  date,
  status,
  exchange,
}) {
  try {
    if (status === "sold") {
      deleteCoin(name);
      return;
    }
    if (status === "active") {
      editCoin(
        name,
        avgBuyAmount,
        quantity,
        investedAmount,
        date,
        status,
        exchange
      );
      return;
    }
    let ExistCoin = await coinModel.findOne({ name: name });

    if (
      ExistCoin &&
      ExistCoin.quantity !== quantity &&
      ExistCoin.status === "in-progress"
    ) {
      editCoin(
        name,
        avgBuyAmount,
        quantity,
        investedAmount,
        date,
        status,
        exchange
      );
      return;
    }
    if (ExistCoin && ExistCoin.quantity == quantity) {
      console.log(name + " exist");
      return;
    }

    if (quantity == 0) {
      return;
    }

    let trades = null;

    if (exchange === "ku_coin") {
      updateKucoinDB(
        name,
        quantity,
        exchange,
        ExistCoin,
        avgBuyAmount,
        investedAmount
      );
      return;
    } else {
      trades = await getLatestTrades(`${name}USDT`);
    }

    if (!ExistCoin) {
      let newCoin;
      if (!(Math.abs(trades[trades.length - 1].qty - quantity) > 0.1)) {
        const trade = trades[trades.length - 1];
        newCoin = new coinModel({
          name,
          avgBuyAmount: trade.price,
          quantity,
          investedAmount: Math.ceil(trade.quoteQty),
          date: trade.time,
          exchange,
          status: "active",
        });
      } else {
        const avg = 10 / quantity;
        newCoin = new coinModel({
          name,
          avgBuyAmount: avg,
          quantity,
          investedAmount: 10,
          date: trades[trades.length - 1].time,
          exchange: "binance",
          status: "in-progress",
        });
      }
      await coinModel.create(newCoin);
    } else {
      const trade = trades[trades.length - 1];
      if (!(trades[trades.length - 1].qty - ExistCoin.quantity) > 0.11) {
        //call update
        editCoin({
          name,
          avgBuyAmount: trade.price,
          quantity,
          investedAmount: Math.ceil(trade.quoteQty),
          date: trade.time,
          status: "active",
        });

        return `edited ${name}`;
      } else {
        const trade = trades[trades.length - 1];
        //more calcultions to find entry
        let findQty = 0;
        let findInvested = 0;
        for (let i = 0; i < trades.length; i++) {
          const qtyAsString = trades[trades.length - i - 1].qty;
          const qtyAsNumber = parseFloat(qtyAsString);
          findQty += qtyAsNumber;

          const InvestAsString = trades[trades.length - i - 1].quoteQty;
          const InvestAsNumber = parseFloat(InvestAsString);
          findInvested += InvestAsNumber;

          if (findQty - quantity <= 0 && findQty - quantity >= -0.1) {
            i = trades.length;
            break;
          }
          if (i == trades.length - 1) {
            findQty = quantity;
            findInvested = 0;
          }
        }
        if (findInvested) avgBuyAmount = findInvested / quantity;

        editCoin({
          name,
          avgBuyAmount,
          quantity,
          investedAmount: findInvested ? findInvested : investedAmount,
          date: trade.time,
          status: findInvested ? "active" : "in-progress",
        });
      }
    }
    return;
  } catch (e) {
    console.log(e);
  }
}

async function addCoin({
  name,
  avgBuyAmount,
  quantity,
  investedAmount,
  date,
  exchange,
}) {
  try {
    if (quantity === 0 || investedAmount === 0 || !exchange) {
      return "error";
    }

    let ExistCoin = await coinModel.findOne({ name: name });

    if (ExistCoin) {
      let newCoin = new coinModel({
        name,
        avgBuyAmount: (ExistCoin.avgBuyAmount + avgBuyAmount) / 2,
        quantity: ExistCoin.quantity + quantity,
        investedAmount: ExistCoin.investedAmount + investedAmount,
        date,
        exchange,
        status: "Active",
      });

      let res = await coinModel.updateOne(newCoin);

      return res;
    }
    let newCoin = new coinModel({
      name,
      avgBuyAmount,
      quantity,
      investedAmount,
      date,
      exchange,
      status: "Active",
    });

    let res = await coinModel.create(newCoin);

    return res;
  } catch (e) {
    console.log(e);
  }
}

async function updateKucoinDB(
  name,
  quantity,
  exchange,
  ExistCoin,
  avgBuyAmount,
  investedAmount
) {
  const allTrades = await getTades();
  let trades = allTrades.filter((trade) => trade.symbol === `${name}-USDT`);
  if (quantity == 0) return;

  let newCoin;
  let avgAmount;

  if (ExistCoin && trades.length > 0) {
    avgAmount = (trades[0].price + ExistCoin.avgBuyAmount) / 2;
  } else if (trades.length > 0) avgAmount = trades[0].price;
  else avgAmount = investedAmount ? investedAmount / quantity : 10 / quantity;

  try {
    if (trades.length > 0) {
      if (!(Math.abs(trades[trades.length - 1].size - quantity) > 0.1)) {
        const trade = trades[trades.length - 1];
        newCoin = new coinModel({
          name,
          avgBuyAmount: avgAmount,
          quantity,
          investedAmount: Math.ceil(trade.funds),
          date: trade.createdAt,
          exchange,
          status: "active",
        });

        await coinModel.create(newCoin);
      } else {
        const avg = investedAmount ? investedAmount / quantity : 10 / quantity;
        newCoin = new coinModel({
          name,
          avgBuyAmount: avg,
          quantity,
          investedAmount: investedAmount ?? 10,
          date: Date.now(),
          exchange: exchange,
          status: "in-progress",
        });
        if (ExistCoin)
          await coinModel.updateOne(
            { id: ExistCoin.id, exchange: "ku_coin" },
            newCoin
          );
        else await coinModel.create(newCoin);
      }
    } else {
      const avg = investedAmount ? investedAmount / quantity : 10 / quantity;
      newCoin = new coinModel({
        name,
        avgBuyAmount: avgBuyAmount ?? avg,
        quantity,
        investedAmount: investedAmount ?? 10,
        date: Date.now(),
        exchange: exchange,
        status: "in-progress",
      });
      if (ExistCoin)
        await coinModel.updateOne(
          { id: ExistCoin.id, exchange: "ku_coin" },
          newCoin
        );
      await coinModel.create(newCoin);
      return newCoin;
    }
  } catch (err) {
    console.log(err, "error");
  }
}
async function viewCoins() {
  try {
    const allCoins = await coinModel.find();

    const coinSymbols = allCoins.map((coin) => coin.name);
    

    // Step 5: Return combined data
    return allCoins;
  } catch (e) {
    console.log(e);
  }
}
async function trunc() {
  let ExistCoin = await coinModel.deleteMany();
}
async function editCoin(
 { name,
  coin,
  avgBuyAmount,
  quantity,
  investedAmount,
  date,
  status,
  exchange,
  lastDate}
) {
  try {
    if(date == ''){
      return  {error: "Date cannot be null" };
    }

    const lastDate = new Date(date);

    const filter = { name: name }; // Specify the coin name to update
    const update = {
      $set: {
        avgBuyAmount: avgBuyAmount,
        quantity: quantity,
        investedAmount: investedAmount,
        lastDate: lastDate,
        status: status,
        exchange,
      },
    };

    const options = { new: true }; // Optional settings, such as returning the updated document

    // Update the document
    const updatedCoin = await coinModel.findOneAndUpdate(
      filter,
      update,
      options
    );

    return updatedCoin;
  } catch (e) {
    return e;
  }
}

async function fetchPricesForCoins(symbols) {
  try {
    const coinPrices = {};
    for (const symbol of symbols) {
      const price = await cryptoPrice.getCoinPriceByShortTicker(symbol);
      coinPrices[symbol?.toLowerCase()] = price;
    }
    return coinPrices;
  } catch (error) {
    throw error;
  }
}

async function deleteCoin(name) {
  await coinModel.deleteOne({ name: name });
}

module.exports = { createCoin, viewCoins, editCoin, trunc, addCoin };
