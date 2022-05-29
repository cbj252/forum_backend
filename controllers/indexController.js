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
    res.json(result._id);
  });
};

exports.posts_get = function (req, res) {
  const startPost = 0;
  if (req.query.start) {
    if (req.query.start.type === Number) {
      startPost = req.query.start;
    }
  }
  Post.find({ thread: req.params.id })
    .skip(startPost)
    .limit(25)
    .populate("author")
    .populate("thread")
    .exec(function (err, result) {
      ifErr(err);
      res.json(result);
    });
};

exports.postCount_get = function (req, res) {
  Post.estimatedDocumentCount({ thread: req.params.id }).exec(function (
    err,
    result
  ) {
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
    res.json(result._id);
  });
};

exports.posts_edit_post = function (req, res) {
  Post.findById(req.params.id, function (err, result) {
    ifErr(err);
    if (result === null) {
      return ifErr("Post not found.");
    } else {
      if (result.author._id == res.locals.currentUser_id) {
        Post.findByIdAndUpdate(
          req.params.id,
          { content: req.body.content },
          { new: true },
          function (err, result) {
            ifErr(err);
            res.json("Post updated\n" + req.body.content);
          }
        );
      } else {
        res.sendStatus(403);
      }
    }
  });
};

exports.posts_delete_post = function (req, res) {
  User.findById(res.locals.currentUser_id).exec(function (err, currentUser) {
    ifErr(err);
    if (currentUser === null) {
      return ifErr("User not found.");
    } else {
      if (currentUser.type === "user") {
        res.sendStatus(403);
      } else {
        Post.findByIdAndDelete(req.params.id, function (err, result) {
          ifErr(err);
          res.json("Post deleted");
        });
      }
    }
  });
};
