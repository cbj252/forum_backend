var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var cors = require("cors");
var compression = require("compression");
var helmet = require("helmet");
require("dotenv").config();

var app = express();

//Set up mongoose connection
var mongoose = require("mongoose");
var mongoDB = process.env.DB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

var corsOptions = {
  origin: "https://forum-frontend-252.herokuapp.com",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(helmet());

var userRouter = require("./routes/user");
app.use("/user", userRouter);
var indexRouter = require("./routes/index");
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

module.exports = app;
