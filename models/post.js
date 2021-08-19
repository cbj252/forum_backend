var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
  time: { type: Date, required: true },
});

//Export model
module.exports = mongoose.model("Post", PostSchema);