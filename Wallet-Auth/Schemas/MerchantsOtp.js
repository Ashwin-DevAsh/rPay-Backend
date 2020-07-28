const mongoose = require("../Database/mongodb");
var Schema = mongoose.Schema;

var merchantOtp = new Schema({
  number: String,
  otp: Number,
  verified: Boolean,
});

module.exports = mongoose.model("merchantOtp", merchantOtp);
