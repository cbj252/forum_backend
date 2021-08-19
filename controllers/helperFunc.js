const { body, validationResult } = require("express-validator");

const ifErr = function ifErr(err) {
  if (err) {
    res.json(err);
  }
}

const validThread = function(req, res, next) {
  body("title", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
}

const validPost = function(req, res, next) {
  body("content", "Content must not be empty.").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
}

module.exports = { ifErr , validThread, validPost };