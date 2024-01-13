const express = require('express');
const router = require('./Routers'); // Import the router
const app = express();
const mongoose = require("mongoose");
const coinsModel = require('./Models/coins');
require('dotenv').config();
app.use(express.json());
const cors = require('cors');

app.use(cors());

app.use('/', router); // Use the router at the root path

const url = 'mongodb+srv://ajithraveendranr:Nf6QrrhvxLFF6TVc@portfolio.61ybdfy.mongodb.net/';

let fn = async () => {
  try {
    await mongoose.connect(url);
    console.log("connected...");
 
  } catch (err) {
    console.error(err);
  }
};
fn();


app.listen(process.env.PORT || 3100, () => {
    console.log('App running on port 3100');
});
