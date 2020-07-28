const app = require("express").Router();
const Merchants = require("../Schemas/Merchants");
const Otp = require("../Schemas/otp");
const jwt = require("jsonwebtoken");
const postgres = require("../Database/postgresql");

app.post("/addMerchant", (req, res) => {
  var merchant = req.body;
  console.log(merchant);

  if (
    !merchant.name ||
    !merchant.email ||
    !merchant.number ||
    !merchant.password ||
    !merchant.fcmToken ||
    !merchant.storeName
  ) {
    res.status(200).send([{ message: "error" }]);
    return;
  }

  Otp.findOne({ number: merchant.number })
    .exec()
    .then((otpDoc) => {
      if (otpDoc && otpDoc.verified) {
        Merchants.findOne({
          $or: [{ number: merchant.number }, { email: merchant.email }],
        })
          .exec()
          .then((doc) => {
            console.log(doc);
            if (doc) {
              res.json([{ message: "merchant already exist" }]);
              return;
            }
            postgres.query(
              "delete from info where id=$1;",
              [merchant.number],
              (err, result) => {
                postgres.query(
                  "insert into info values($1,$2,null,null)",
                  [merchant.number, merchant.fcmToken],
                  (err, result) => {
                    if (!err) {
                      postgres.query(
                        "insert into amount(id,balance) values($1,0)",
                        [merchant.number],
                        (err, result) => {
                          if (!err) {
                            if (doc) {
                              res.json([{ message: "merchant already exist" }]);
                            } else {
                              let merchantObject = new Merchants({
                                name: merchant.name,
                                number: merchant.number,
                                email: merchant.email,
                                password: merchant.password,
                                accountInfo: {
                                  accountNumber: merchant.accountNumber,
                                  Ifsc: merchant.ifsc,
                                  upiID: merchant.upiID,
                                },
                                id: `@rbusiness${user.number}`,
                                qrcode: jwt.sign(
                                  {
                                    name: user.name,
                                    id: `@rbusiness${user.number}`,
                                    number: user.number,
                                  },
                                  process.env.QRKEY
                                ),
                                storeName: merchant.storeName,
                                status: "Pending",
                              });
                              jwt.sign(
                                {
                                  name: merchant.name,
                                  number: merchant.number,
                                  email: merchant.email,
                                },
                                process.env.PRIVATE_KEY,
                                (err, token) => {
                                  if (err) {
                                    res.json([{ message: err.getName() }]);
                                  } else {
                                    merchantObject
                                      .save()
                                      .then((result) => {
                                        console.log(token);
                                        res.json([{ message: "done", token }]);
                                      })
                                      .catch((err) => {
                                        res.json([{ message: "failed" }]);
                                      });
                                  }
                                }
                              );
                            }
                          } else {
                            res.json([{ message: err }]);
                          }
                        }
                      );
                    } else {
                      res.json([{ message: err }]);
                    }
                  }
                );
              }
            );
          })
          .catch(() => {
            res.json([{ message: "failed" }]);
          });
      } else {
        res.json([{ message: "number not verified" }]);
      }
    })
    .catch((err) => {
      res.json([{ message: "error" }]);
    });
});

app.get("/getMerchants", (req, res) => {
  console.log("getting merchants");
  Merchants.find({}, [
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
