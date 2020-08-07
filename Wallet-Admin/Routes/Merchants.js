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

app.post("/updateMerchantStatus", (req, res) => {
  var id = req.body.id;
  var status = req.body.status;
  if (!id || !status) {
    res.send({ message: "error" });
    return;
  }
  Users.findOneAndUpdate({ id }, { status })
    .exec()
    .then((doc) => {
      res.send({ message: "done" });
    })
    .catch((e) => {
      res.send({ message: "error", e });
    });
});

module.exports = app;
