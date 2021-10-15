const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
});

module.exports = mongoose.model("Order", schema);
 