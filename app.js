const express = require("express");
const app = express();
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const notFoundRoutes = require("./routes/404");
const Path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user");
const product = require("./models/product");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
const MongoDbStore = require("connect-mongodb-session")(session);
const MONGODB_URI =
  "mongodb+srv://Promise:WizDon1996@cluster0.sx5qn.mongodb.net/shop?retryWrites=true&w=majority";

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  session({
    secret: "my secrete",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      return next();
    })
    .catch((error) => {
      console.log(error);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (req.session.isLoggedIn && (req.url == "/login" || req.url == "/signup")) {
    return res.redirect("/");
  }
  next();
});

app.use(authRoutes);
app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(notFoundRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000, () => {
      console.log("Connected!");
    });
  })
  .catch((error) => {
    console.log(error);
  });
