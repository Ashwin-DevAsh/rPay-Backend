const mongoose = require("../Database/mongodb");
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
  name: String,
  number: String,
  email: String,
  password: String,
  imageURL: String,
  accountInfo: {
    accountNumber: String,
    Ifsc: String,
    upiID: String,
  },
  storeName: String,
  status: "Pending",
});

module.exports = mongoose.model("Merchants", UsersSchema);
