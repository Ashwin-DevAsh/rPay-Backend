const mongoose = require("../Database/mongodb");
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
  name: String,
  number: String,
  email: String,
  password: String,
  imageURL: String,
  id: String,
  qrCode: String,
});

module.exports = mongoose.model("Users", UsersSchema);
