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

test("POST /user/login succeeds", async () => {
  const makeUser = await request(app).post("/user/signup").send({
    username: "test_user",
    password: "password"
  });
  expect(makeUser.body).toBe("User created")

  const loginResult = await login(app, "test_user");
  expect(loginResult).toBeDefined();
});

test("POST /user/login fails if putting invalid credentials", async () => {
  const loginResult = await login(app, "test_user");
  expect(loginResult).toBe("Incorrect username.")
});

test("GET /user/current", async () => {
  await populateData();

  const authToken = await login(app, "test_user");
  expect(authToken.split(" ")[0]).toBe("Bearer")
  const getCurrent = await request(app).get("/user/current").set({ authorization: authToken })
  expect(getCurrent.body).toEqual(expect.objectContaining({
      _id: expect.anything(),
      username: "test_user",
      password: expect.not.stringContaining("password"),
      type: "user",
    }));

  const authTokenAdmin = await login(app, "test_admin");
  expect(authTokenAdmin.split(" ")[0]).toBe("Bearer")
  const getAdmin = await request(app).get("/user/current").set({ authorization: authTokenAdmin })
  expect(getAdmin.body).toEqual(expect.objectContaining({
      _id: expect.anything(),
      username: "test_admin",
      password: expect.not.stringContaining("password"),
      type: "admin",
    }));
});

test("POST /user/admin/:id/make", async () => {
  const [userId, adminId, ownerId] = await populateData();
  const authTokenUser = await login(app, "test_user");
  const authTokenAdmin = await login(app, "test_admin");
  const noAuth = await request(app).post(`/user/admin/${userId}/make`).set({ authorization: authTokenUser })
  expect(noAuth.statusCode).toBe(403);
  const getAdmin = await request(app).post(`/user/admin/${userId}/make`).set({ authorization: authTokenAdmin })
  expect(getAdmin.body).toBe("Admin created administrator");
});

test("POST /user/admin/:id/remove", async () => {
  const [userId, adminId, ownerId] = await populateData();
  const authTokenAdmin = await login(app, "test_admin");
  const authTokenOwner = await login(app, "test_owner");
  const noAuth = await request(app).post(`/user/admin/${adminId}/remove`).set({ authorization: authTokenAdmin })
  expect(noAuth.statusCode).toBe(403);
  const getAdmin = await request(app).post(`/user/admin/${adminId}/remove`).set({ authorization: authTokenOwner })
  expect(getAdmin.body).toBe("Admin removed user");
});