const mongoose = require("../Connections/connection");
var Schema = mongoose.Schema;

var MerchantSchema = new Schema({
  name: String,
  imageURL: String,
  walletId:String
});

module.exports = mongoose.model("Merchants", MerchantSchema);
