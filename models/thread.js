var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ThreadSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  time: { type: Date, required: true },
});

//Export model
module.exports = mongoose.model("Thread", ThreadSchema);
