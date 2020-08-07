const mongoose = require("../Database/mongodb");
var Schema = mongoose.Schema;

var recoveryOtpSchema = new Schema({
  emailID: String,
  otp: Number,
  verified: Boolean,
});

module.exports = mongoose.model("recoveryOtpMerchant", recoveryOtpSchema);
