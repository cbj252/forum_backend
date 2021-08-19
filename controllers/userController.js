const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ifErr } = require("./helperFunc.js");

const User = require("../models/user");

exports.signUp_post = function (req, res) {
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) {
      res.json("Hashing error.");
    } else {
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        type: req.body.type,
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
    if (result == null) {
      res.json("Incorrect username.");
    }
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
  });
};

// Logout is done via frontend.
