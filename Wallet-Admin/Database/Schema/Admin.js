const mongoose = require("../Connections/connection");
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
  name: String,
  number: String,
  email: String,
  password: String,
  imageURL: String,
  accessTo: Array
});

module.exports = mongoose.model("Admins", AdminSchema);
