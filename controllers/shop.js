const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).render("./shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (error) {
    throw error;
  }
};

exports.getIndex = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).render("./shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (error) {
    throw error;
  }
};

exports.getCart = async (req, res) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.status(200).render("./shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postCart = async (req, res) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getCheckout = async (req, res) => {
  res.status(200).render("./shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.postCartDeleteProduct = async (req, res) => {
  const productId = req.body.cartProductId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("back");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getProduct = async (req, res) => {
  const id = req.params.productId;
  Product.findById(id)
    .then((product) => {
      res.status(200).render("./shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postOrder = async (req, res) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return { quantity: item.quantity, product: { ...item.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      return res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = async (req, res) => {
  req.user
    .getOrders()
    .then((orders) => {
      return res.status(200).render("./shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders
      });
    })
    .catch((err) => console.log(err));
};
