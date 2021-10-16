const crypto = require("crypto");
const User = require("../models/user");
const { hash, verify } = require("../utils/functions");
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox9815014643954952be6288399b141d18.mailgun.org";
const apiKey = "189d7ea75caa13356e677346f6b85894-2ac825a1-66376cec";
const mg = mailgun({ apiKey: apiKey, domain: DOMAIN });

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
  });
};

exports.postLogin = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email and password.");
        return res.redirect("/login");
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
          req.flash("error", "Invalid email and password.");
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
  });
};

exports.postSignUp = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const hashedP = await hash(password);
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "E-mail already exists.");
        return res.redirect("/signup");
      }
      if (password != confirmPassword) {
        req.flash("error", "Password must match confirm password field.");
        return res.redirect("/signup");
      }
      return User.create({
        email: email,
        password: hashedP,
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
              if (err) console.log(err);
              if (!err) console.log(body);
            }
          );
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .then((result) => {})
    .catch((error) => {
      console.log(error);
    });
};

exports.getReset = async (req, res) => {
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

exports.postReset = async (req, res) => {
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
            if (err) console.log(err);
            if (!err) console.log(body);
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    return res.redirect("back");
  }
};

exports.getNewPassword = async (req, res) => {
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
    .catch((error) => console.log(error));
  let message = req.flash("error");
};

exports.postNewPassword = async (req, res) => {
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
    .catch((error) => console.log(error));
};
