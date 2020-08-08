const mongoose = require("../Connections/connection");
var Schema = mongoose.Schema;

var Block = new Schema({
  blockNumber: Number,
  description: String,
  data: Object,
  prevHash: String,
});

module.exports = mongoose.model("Blocks", Block);
