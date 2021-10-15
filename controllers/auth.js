const mongoose = require("mongoose");
const User = require("../models/user");
const { hash, verify } = require("../utils/functions");

exports.getLogin = async (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) return res.redirect("/login");
      verify(password, user.password)
        .then((isValid) => {
          console.log(isValid);
          if (isValid) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              if (!err) return res.redirect("/");
            });
          }
          return res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postLogout = async (req, res) => {
  req.session.destroy((error) => {
    console.log(error);
    if (!error) return res.redirect("/");
  });
};

exports.getSignUp = async (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postSignUp = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const hashedP = await hash(password);
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) return res.redirect("/signup");
      if (password != confirmPassword) return res.redirect("/signup");
      return User.create({
        email: email,
        password: hashedP,
        cart: { items: [] },
      })
        .then((user) => {
          return res.redirect("/login");
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};
