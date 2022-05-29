const User = require("../models/user");
const Thread = require("../models/thread");
const Post = require("../models/post");
const request = require("supertest");

const hashOfPassword =
  "$2b$10$jdbeB2//h6UFSWYJ4/joTuH/oT6Bjjp8FV9kB8vCI.qoE9JVBA7l6";

async function login(app, username) {
  const getToken = await request(app).post("/user/login").send({
    username: username,
    password: "password",
  });
  if (getToken.body.token) {
    return "Bearer " + getToken.body.token;
  } else {
    return getToken.body;
  }
}

async function populateUsers() {
  const addUser = User.create({
    username: "test_user",
    password: hashOfPassword,
    type: "user",
  });
  const addAdmin = User.create({
    username: "test_admin",
    password: hashOfPassword,
    type: "admin",
  });
  const addOwner = User.create({
    username: "test_owner",
    password: hashOfPassword,
    type: "owner",
  });

  const results = await Promise.all([addUser, addAdmin, addOwner]);

  return results.map(function (user) {
    return user._id;
  });
}

async function makeThread(app) {
  const authTokenUser = await login(app, "test_user");
  const makeThread = await request(app)
    .post("/threads")
    .set({ authorization: authTokenUser })
    .send({
      title: "Test Thread",
    });
  if (makeThread.body.length != 24) {
    throw new Error("Error making thread, returning" + makeThread.body.length);
  }
  return makeThread.body;
}

async function makePost(app, givenThreadId) {
  const authTokenUser = await login(app, "test_user");

  const makePost = await request(app)
    .post(`/threads/${givenThreadId}`)
    .set({ authorization: authTokenUser })
    .send({
      content: "Test Post",
    });
  if (makePost.body.length != 24) {
    throw new Error("Error making post, returning" + makePost.body.length);
  }
  return makePost.body;
}

module.exports = { login, populateUsers, makeThread, makePost };
