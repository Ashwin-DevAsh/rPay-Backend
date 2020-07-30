const mongoose = require("../Database/mongodb");
var Schema = mongoose.Schema;

var recoveryOtptpSchema = new Schema({
  emailID: String,
  otp: Number,
  verified: Boolean,
});

module.exports = mongoose.model("recoveryOtptpSchema", recoveryOtptpSchema);
