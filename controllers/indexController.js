const {
  ifErr,
  validThread,
  validPost,
  userAuthLevel,
} = require("./helperFunc.js");

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

exports.posts_edit_post = function (req, res) {
  validPost(req, res);
  Post.findById(req.params.id, function (err, result) {
    ifErr(err);
    if (result.author._id == res.locals.currentUser_id) {
      Post.findByIdAndUpdate(
        req.params.id,
        { content: req.body.content },
        function (err, result) {
          ifErr(err);
          res.json("Post updated" + result);
        }
      );
    } else {
      res.sendStatus(403);
    }
  });
};

exports.posts_delete_post = function (req, res) {
  validPost(req, res);
  const authLevel = userAuthLevel(res.locals.currentUser_id);
  if (authLevel == "user") {
    res.sendStatus(403);
  } else {
    Post.findByIdAndDelete(req.params.id, function (err, result) {
      ifErr(err);
      res.json("Post deleted" + result);
    });
  }
};
