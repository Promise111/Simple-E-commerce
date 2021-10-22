const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const { hash, verify } = require("../utils/functions");
const mailgun = require("mailgun-js");
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.DOMAIN,
});

exports.getLogin = async (req, res) => {
  let message = req.flash("error");
  if (message.length <= 0) {
    message = null;
  } else {
    message = message[0];
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
    old: req.body,
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      old: req.body,
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid email and password.",
          old: req.body,
          validationErrors: [],
        });
      }
      verify(password, user.password)
        .then((isValid) => {
          if (isValid) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              if (!err) return res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            errorMessage: "Invalid email and password.",
            old: req.body,
            validationErrors: [],
          });
        })
        .catch((error) => {
          return next(error);
        });
    })
    .catch((error) => {
      return next(error);
    });
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) next(error);
    if (!error) return res.redirect("/");
  });
};

exports.getSignUp = async (req, res, next) => {
  let message = req.flash("error");
  if (message.length <= 0) {
    message = null;
  } else {
    message = message[0];
  }
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
    old: req.body,
    validationErrors: [],
  });
};

exports.postSignUp = async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const hashed = await hash(password);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      old: req.body,
      validationErrors: errors.array(),
    });
  }
  return User.create({
    email: email,
    password: hashed,
    cart: { items: [] },
  })
    .then((user) => {
      req.flash("status", "Account created, please log in.");
      res.redirect("/login");
      return mg.messages().send(
        {
          from: "Shop <me@shop.com>",
          to: `${email}`,
          subject: "Signup successful!",
          html: "<h1>You successfuly signed up!</h1>",
        },
        (err, body) => {
          if (err) return next(err);
          if (!err) console.log(body);
        }
      );
    })
    .catch((error) => {
      return next(error);
    });
};

exports.getReset = async (req, res, next) => {
  let message = req.flash("error");
  if (message.length <= 0) {
    message = null;
  } else {
    message = message[0];
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: message,
  });
};

exports.postReset = async (req, res, next) => {
  const token = crypto.randomBytes(32).toString("hex");
  const email = req.body.email;
  if (token) {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that e-mail found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((user) => {
        res.redirect("/");
        return mg.messages().send(
          {
            from: "Shop <me@shop.com>",
            to: `${email}`,
            subject: "Password reset",
            html: `<p>You requested a password reset</p>
            <p>Click <a href="http://localhost:3000/reset/${token}">this</a> to set a new password.</p>
            `,
          },
          (err, body) => {
            if (err) return next(err);
            if (!err) console.log(body);
          }
        );
      })
      .catch((error) => {
        return next(error);
      });
  } else {
    return res.redirect("back");
  }
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  if (!token) {
    req.flash("error", "Token required.");
    return res.redirect("/reset");
  }
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Token expired or has been used.");
        return res.redirect("/reset");
      }
      if (message.length <= 0) {
        message = null;
      } else {
        message = message[0];
      }
      return res.render("auth/new-password", {
        pageTitle: "Update Password",
        path: "/new-password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((error) => {
      return next(error);
    });
  let message = req.flash("error");
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  const hashedPassword = await hash(newPassword);

  User.findOne({
    _id: userId,
    resetTokenExpiration: { $gt: Date.now() },
    resetToken: passwordToken,
  })
    .then((user) => {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      return user.save();
    })
    .then((result) => {
      return res.redirect("/login");
    })
    .catch((error) => {
      return next(error);
    });
};
