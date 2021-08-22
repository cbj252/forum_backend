const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ifErr } = require("./helperFunc.js");

const User = require("../models/user");

exports.users_get = function (req, res) {
  User.find().exec(function (err, result) {
    ifErr(err);
    res.json(result);
  });
};

exports.signUp_post = function (req, res) {
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) {
      res.json("Hashing error.");
    } else {
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        type: "user",
      });
      newUser.save(function (err) {
        ifErr(err);
        res.json("User created");
      });
    }
  });
};

exports.login_post = function (req, res) {
  User.findOne({ username: req.body.username }).exec(function (err, result) {
    ifErr(err);
    if (result === null) {
      res.json("Incorrect username.");
    } else {
      bcrypt.compare(
        req.body.password,
        result.password,
        function (err, passwordMatch) {
          if (err) {
            res.json("Database error.");
          }
          if (passwordMatch) {
            jwt.sign({ id: result._id }, "secretKey", (err, token) => {
              ifErr(err);
              res.json({ token });
            });
          } else {
            res.json("Incorrect password.");
          }
        }
      );
    }
  });
};

exports.user_current_get = function (req, res) {
  User.findById(res.locals.currentUser_id).exec(function (err, result) {
    if (result == null) {
      ifErr(err);
    } else {
      res.json(result);
    }
  });
};

exports.admin_make_post = function (req, res) {
  User.findById(res.locals.currentUser_id).exec(function (err, currentUser) {
    ifErr(err);
    if (currentUser.type === null) {
      return ifErr("User not found.");
    } else {
      if (currentUser.type != "user") {
        User.findByIdAndUpdate(
          req.params.id,
          { type: "administrator" },
          function (err, result) {
            ifErr(err);
            res.json("Admin created." + result);
          }
        );
      }
    }
  });
};

exports.admin_remove_post = function (req, res) {
  User.findById(res.locals.currentUser_id).exec(function (err, currentUser) {
    ifErr(err);
    if (currentUser.type === null) {
      return ifErr("User not found.");
    } else {
      if (currentUser.type == "owner") {
        User.findByIdAndUpdate(
          req.params.id,
          { type: "user" },
          function (err, result) {
            ifErr(err);
            res.json("Admin status removed." + result);
          }
        );
      }
    }
  });
};

// Logout is done via frontend.
