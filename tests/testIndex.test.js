const { login, populateData, makePost } = require("./helper");

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const bcrypt = require("bcrypt");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

var userRouter = require("../routes/user");
app.use("/user", userRouter);
var indexRouter = require("../routes/index");
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  res.json(err.message);
});

const request = require('supertest');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

const User = require("../models/user");
const Thread = require("../models/thread");
const Post = require("../models/post");

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Thread.deleteMany({}), Post.deleteMany({})]);
});

afterAll(async () => {
  mongoose.disconnect();
  mongoServer.stop();
});

test("Index Routes need auth", async () => {
  const noAuth = await request(app).get("/threads")
  expect(noAuth.body).toBe("No authentication included in Request.");
});

test("GET/POST /threads", async () => {
  const [userId, adminId, ownerId] = await populateData();
  const authTokenUser = await login(app, "test_user");
  const makeThread = await request(app).post("/threads").set({ authorization: authTokenUser }).send({
    title: "Test Thread",
  });
  expect(makeThread.body.length).toBe(24);
  const getThread = await request(app).get("/threads").set({ authorization: authTokenUser });
  expect(getThread.body[0]).toEqual(expect.objectContaining({
      _id: expect.anything(),
      title: "Test Thread",
      time: expect.anything(),
    })
  );
});

test("GET/POST /threads/:id", async () => {
  const [userId, adminId, ownerId] = await populateData();
  const authTokenUser = await login(app, "test_user");
  const makeThread = await request(app).post("/threads").set({ authorization: authTokenUser }).send({
    title: "Test Thread",
  });
  expect(makeThread.body.length).toBe(24);
  const makePost = await request(app).post(`/threads/${makeThread.body}`).set({ authorization: authTokenUser }).send({
    content: "Test Post",
  });
  expect(makePost.body.length).toBe(24);
  const getPost = await request(app).get(`/threads/${makeThread.body}`).set({ authorization: authTokenUser });
  expect(getPost.body[0]).toEqual(expect.objectContaining({
      _id: expect.anything(),
      content: "Test Post",
      time: expect.anything(),
    })
  );
});

test("POST /threads/:id/edit", async () => {
  const postId = await makePost(app);
  const authTokenUser = await login(app, "test_user");
  const authTokenOwner = await login(app, "test_owner");
  const notUser = await request(app).post(`/threads/${postId}/edit`).set({ authorization: authTokenOwner }).send({
    content: "Edited",
  });
  expect(notUser.statusCode).toBe(403);
  const editPost = await request(app).post(`/threads/${postId}/edit`).set({ authorization: authTokenUser }).send({
  content: "Edited",
  });
  expect(editPost.body).toBe("Post updated\nEdited");
});

test("POST /threads/:id/delete", async () => {
  const postId = await makePost(app);
  const authTokenUser = await login(app, "test_user");
  const authTokenOwner = await login(app, "test_owner");
  const noAuth = await request(app).post(`/threads/${postId}/delete`).set({ authorization: authTokenUser });
  expect(noAuth.statusCode).toBe(403);
  const editPost = await request(app).post(`/threads/${postId}/delete`).set({ authorization: authTokenOwner });
  expect(editPost.body).toBe("Post deleted");
  const check = await Post.find({});
  expect(check).toEqual([]);
});