const { MongoMemoryServer } = require('mongodb-memory-server');
var mongoose = require("mongoose");

// This will create an new instance of "MongoMemoryServer" and automatically start it
const createServer = async function() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  mongoose.connection.once("open", () => {
    console.log(`MongoDB successfully connected to ${uri}`);
  });
}