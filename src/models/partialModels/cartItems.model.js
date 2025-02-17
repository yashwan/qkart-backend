const mongoose = require("mongoose");
const Product = require("../product.model")


const cartItemSchema = new mongoose.Schema({
    product: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
    quantity: {type: Number, required: true}
})

module.exports.cartItemSchema = cartItemSchema
