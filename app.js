const express = require("express");
const app = express();
require("dotenv").config();
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorRoutes = require("./routes/error");
const Path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user");
const product = require("./models/product");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const MongoDbStore = require("connect-mongodb-session")(session);

const store = new MongoDbStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(
  multer({ storage: diskStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(Path.join(__dirname, "public")));
app.use("/images", express.static(Path.join(__dirname, "images")));
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
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      return next();
    })
    .catch((error) => {
      return next(error);
    });
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
app.use(errorRoutes);
app.use((error, req, res, next) => {
  console.log(error.message);
  if (error.httpStatusCode === 401) {
    return res.status(401).render("401", {
      pageTitle: "401 | Authorization required.",
      path: "/401",
      isAuthenticated: req.session.isLoggedIn,
      csrfToken: req.csrfToken(),
    });
  } else {
    return res.status(500).render("500", {
      pageTitle: "500 | Internal server error.",
      path: "/500",
      isAuthenticated: req.session.isLoggedIn,
      csrfToken: req.csrfToken(),
    });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Connected!");
    });
  })
  .catch((error) => {
    console.log(error);
  });
