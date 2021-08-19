const { ifErr, validThread, validPost } = require("./helperFunc.js");

var debug = require("debug")("indexController");

const User = require("../models/user");
const Thread = require("../models/thread");
const Post = require("../models/post");

exports.threads_get = function (req, res) {
  Thread.find()
    .populate("author")
    .exec(function (err, result) {
      ifErr(err);
      res.json(result);
    });
};

exports.threads_post = function (req, res) {
  validThread(req, res);
  const newThread = new Thread({
    author: res.locals.currentUser_id,
    title: req.body.title,
    time: Date.now(),
  });

  newThread.save(function (err, result) {
    ifErr(err);
    res.json("Thread made." + result);
  });
};

exports.posts_get = function (req, res) {
  Post.find({ thread: req.params.id })
    .populate("author")
    .populate("thread")
    .exec(function (err, result) {
      ifErr(err);
      res.json(result);
    });
};

exports.posts_post = function (req, res) {
  validPost(req, res);
  const newPost = new Post({
    author: res.locals.currentUser_id,
    content: req.body.content,
    thread: req.params.id,
    time: Date.now(),
  });

  newPost.save(function (err, result) {
    ifErr(err);
    res.json("Post made." + result);
  });
};
