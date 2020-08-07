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

app.post("/changeMerchantPassword", (req, res) => {
  console.log(req.get("token"));

  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, function (
    err,
    decoded
  ) {
    if (err) {
      console.log(err);
      res.status(200).send({ message: "error" });
      return;
    } else {
      console.log("Changing password...");
      var data = req.body;
      console.log(data);
      if (!data.id || !data.oldPassword || !data.newPassword) {
        res.status(200).send({ message: "error" });
        return;
      }

      Users.findOne({ id: data.id })
        .exec()
        .then((docs) => {
          console.log("data = ", docs);
          if (docs == null) {
            res.status(200).send({ message: "error" });
            return;
          }

          if (docs.password == data.oldPassword) {
            Users.findOneAndUpdate(
              { id: data.id },
              { password: data.newPassword },
              (err, doc) => {
                if (err) {
                  console.log(err);
                  res.status(200).send({ message: "error" });
                  return;
                } else {
                  res.status(200).send({ message: "done" });
                  return;
                }
              }
            );
          } else {
            console.log("data = ", null);

            res.status(200).send({ message: "error" });
            return;
          }
        });
    }
  });
});

app.post("/updateMerchantStatus", (req, res) => {
  var id = req.body.id;
  var status = req.body.status;
  console.log(id, status);
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
