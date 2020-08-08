const app = require("express").Router();
const Users = require("../Schemas/Merchants");
const Otp = require("../Schemas/MerchantsOtp");
const jwt = require("jsonwebtoken");
const postgres = require("../Database/postgresql");
const axios = require("axios");

app.post("/addMerchant", async (req, res) => {
  var user = req.body;
  console.log(user);

  if (
    !user.name ||
    !user.email ||
    !user.number ||
    !user.password ||
    !user.fcmToken ||
    !user.storeName
  ) {
    res.status(200).send([{ message: "error" }]);
    return;
  }

  var userID = `rbusiness@${user.number}`;

  try {
    var otp = await Otp.findOne({ number: user.number }).exec();
    if (otp && otp.verified) {
      var userDoc = await Users.findOne({
        $or: [{ number: user.number }, { email: user.email }],
      }).exec();

      if (userDoc) {
        res.json([{ message: "User already exist" }]);
        return;
      }

      await postgres.query("delete from info where id=$1;", [userID]);
      await postgres.query("delete from amount where id=$1;", [userID]);
      await postgres.query("insert into info values($1,$2,null,null)", [
        userID,
        user.fcmToken,
      ]);
      await postgres.query("insert into amount(id,balance) values($1,0)", [
        userID,
      ]);

      let userObject = new Users({
        name: user.name,
        number: user.number,
        email: user.email,
        password: user.password,
        qrCode: user.qrCode,
        id: userID,
        storeName: user.storeName,
        status: "pending",
        imageURL: null,
      });

      var token = jwt.sign(
        {
          name: user.name,
          id: userID,
          number: user.number,
          email: user.email,
        },
        process.env.PRIVATE_KEY
      );

      var blockResult = await axios.post(
        "http://wallet-block:9000/addUserBlock",
        {
          id: userID,
          initialAmount: 0,
        }
      );

      if ((blockResult.data["message"] = "done")) {
        await userObject.save();
        res.json([{ message: "done", token }]);
      } else {
        res.json([{ message: "failed" }]);
      }
    }
  } catch (e) {
    console.log(e);
    res.json([{ message: "failed" }]);
  }
});

app.get("/getMerchants", (req, res) => {
  console.log("getting merchants");
  Users.find({ status: "active" }, [
    "name",
    "number",
    "email",
    "id",
    "storeName",
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

app.get("/getMerchant", (req, res) => {
  if (req.query.id) {
    Users.findOne({ id: req.query.id }, [
      "name",
      "number",
      "email",
      "id",
      "qrCode",
      "imageURL",
      "accountInfo",
      "storeName",
      "status",
    ]).then((doc) => {
      console.log(doc);
      res.status(200).send(doc);
    });
  } else {
    console.log(err);
    res.json({ message: "failed" });
  }
});

module.exports = app;
