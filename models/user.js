const mongoose = require("mongoose");
const Order = require("./order");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

schema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

schema.methods.removeFromCart = function (productId) {
  let updatedItems;
  const items = [...this.cart.items];
  console.log(items);
  const itemIndex = this.cart.items.findIndex(
    (item) => productId === item.productId.toString()
  );
  items.splice(itemIndex, 1);
  updatedItems = items;
  console.log(items);
  this.cart.items = items;
  return this.save();
};

schema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

schema.methods.getOrders = function () {
  return Order.find({ "user.userId": this._id })
    .then((orders) => {
      return orders;
    })
    .catch((error) => {
      console.log(error.message);
    });
};

module.exports = mongoose.model("User", schema);
