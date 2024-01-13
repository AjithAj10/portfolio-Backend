const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avgBuyAmount: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    investedAmount: {
        type: Number,
        required: true
    },
    lastDate: {
        type: Date,
        required: false
    },
    exchange: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'in-progress', 'closed', 'sold'],
        required: true
    }
})

module.exports = mongoose.model('coinsModel', coinSchema)