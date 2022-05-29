const { login, populateUsers, makeThread, makePost } = require("./helper");

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

const request = require("supertest");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongoServer;

const User = require("../models/user");
const Thread = require("../models/thread");
const Post = require("../models/post");
const thread = require("../models/thread");

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await populateUsers();
});

beforeEach(async () => {
  await Promise.all([Thread.deleteMany({}), Post.deleteMany({})]);
});

afterAll(async () => {
  mongoose.disconnect();
  mongoServer.stop();
});

test("Index Routes need auth", async () => {
  const noAuth = await request(app).get("/threads");
  expect(noAuth.body).toBe("No authentication included in Request.");
});

test("GET/POST /threads", async () => {
  const authTokenUser = await login(app, "test_user");
  const threadId = await makeThread(app);
  // 24 is the amount of characters in IDs.
  expect(threadId.length).toBe(24);
  const getThread = await request(app)
    .get("/threads")
    .set({ authorization: authTokenUser });
  expect(getThread.body[0]).toEqual(
    expect.objectContaining({
      _id: expect.anything(),
      title: "Test Thread",
      time: expect.anything(),
    })
  );
});

test("GET/POST /threads/:id", async () => {
  const authTokenUser = await login(app, "test_user");
  const threadId = await makeThread(app);
  const postId = await makePost(app, threadId);
  expect(postId.length).toBe(24);
  const getPost = await request(app)
    .get(`/threads/${threadId}`)
    .set({ authorization: authTokenUser });
  expect(getPost.body[0]).toEqual(
    expect.objectContaining({
      _id: expect.anything(),
      content: "Test Post",
      time: expect.anything(),
    })
  );
  for (let i = 0; i < 30; i++) {
    await makePost(app, threadId);
  }
  const getThreadCutoff = await request(app)
    .get(`/threads/${threadId}?start=25`)
    .set({ authorization: authTokenUser });
  // Posts 26,27,28,30 and 31.
  expect(getThreadCutoff.body.length).toEqual(6);
});

test("GET /threads/:id/count", async () => {
  const authTokenUser = await login(app, "test_user");
  const threadId = await makeThread(app);
  for (let i = 0; i < 2; i++) {
    await makePost(app, threadId);
  }
  const postCount = await request(app)
    .get(`/threads/${threadId}/count`)
    .set({ authorization: authTokenUser });
  expect(postCount.body).toEqual(2);
});

test("POST /threads/:id/edit", async () => {
  const threadId = await makeThread(app);
  const postId = await makePost(app, threadId);
  const [authTokenUser, authTokenOwner] = await Promise.all([
    login(app, "test_user"),
    login(app, "test_owner"),
  ]);

  const notUser = request(app)
    .post(`/threads/${postId}/edit`)
    .set({ authorization: authTokenOwner })
    .send({
      content: "Edited",
    });

  const editPost = request(app)
    .post(`/threads/${postId}/edit`)
    .set({ authorization: authTokenUser })
    .send({
      content: "Edited",
    });

  const [notUserResult, editPostResult] = await Promise.all([
    notUser,
    editPost,
  ]);

  expect(notUserResult.statusCode).toBe(403);
  expect(editPostResult.body).toBe("Post updated\nEdited");
});

test("POST /threads/:id/delete", async () => {
  const threadId = await makeThread(app);
  const postId = await makePost(app, threadId);
  const [authTokenUser, authTokenOwner] = await Promise.all([
    login(app, "test_user"),
    login(app, "test_owner"),
  ]);
  const noAuth = await request(app)
    .post(`/threads/${postId}/delete`)
    .set({ authorization: authTokenUser });

  const editPost = await request(app)
    .post(`/threads/${postId}/delete`)
    .set({ authorization: authTokenOwner });

  const [noAuthResult, editPostResult] = await Promise.all([noAuth, editPost]);

  expect(noAuthResult.statusCode).toBe(403);
  expect(editPostResult.body).toBe("Post deleted");

  const check = await Post.find({});
  expect(check).toEqual([]);
});
