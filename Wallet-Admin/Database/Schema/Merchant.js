const mongoose = require("../Connections/connection");
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
  name: String,
  number: String,
  email: String,
  password: String,
  imageURL: String,
  id: String,
  qrCode: String,
  accountInfo: {
    accountNumber: String,
    Ifsc: String,
    upiID: String,
  },
  storeName: String,
  status: String,
});

module.exports = mongoose.model("Merchants", UsersSchema);
