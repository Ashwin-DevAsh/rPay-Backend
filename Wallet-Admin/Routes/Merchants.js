const app = require("express").Router();
const Users = require("../Database/Schema/Merchant");

app.get("/getMerchants", (req, res) => {
  console.log("getting merchants");
  Users.find({}, [
    "name",
    "number",
    "email",
    "id",
    "qrCode",
    "imageURL",
    "accountInfo",
    "storeName",
    "status",
  ])
    .exec()
    .then((doc) => {
      console.log(doc);
      res.status(200).send(doc);
    })
    .catch((e) => {
      console.log(e);
      res.send(e);
    });
});

module.exports = app;
