const app = require("express").Router();
const Users = require("../Schemas/Merchants");
const Otp = require("../Schemas/MerchantsOtp");
const jwt = require("jsonwebtoken");
const postgres = require("../Database/postgresql");

app.post("/addMerchant", (req, res) => {
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
  Otp.findOne({ number: user.number })
    .exec()
    .then((otpDoc) => {
      console.log(otpDoc);
      if (otpDoc && otpDoc.verified) {
        Users.findOne({
          $or: [{ number: user.number }, { email: user.email }],
        })
          .exec()
          .then((doc) => {
            console.log(doc);
            if (doc) {
              res.json([{ message: "User already exist" }]);
              return;
            }
            postgres.query(
              "delete from info where id=$1;",
              [userID],
              (err, result) => {
                postgres.query(
                  "insert into info values($1,$2,null,null)",
                  [userID, user.fcmToken],
                  (err, result) => {
                    if (!err) {
                      postgres.query(
                        "insert into amount(id,balance) values($1,0)",
                        [userID],
                        async (err, result) => {
                          if (!err) {
                            if (doc) {
                              res.json([{ message: "User already exist" }]);
                              Otp.deleteMany({ number: user.number }).exec();
                            } else {
                              let userObject = new Users({
                                name: user.name,
                                number: user.number,
                                email: user.email,
                                password: user.password,
                                qrCode: user.qrCode,
                                id: userID,
                                storeName: user.storeName,
                              });
                              jwt.sign(
                                {
                                  name: user.name,
                                  id: userID,
                                  number: user.number,
                                  email: user.email,
                                },
                                process.env.PRIVATE_KEY,
                                (err, token) => {
                                  if (err) {
                                    res.json([{ message: err.getName() }]);
                                  } else {
                                    userObject
                                      .save()
                                      .then((result) => {
                                        console.log(token);
                                        res.json([{ message: "done", token }]);
                                      })
                                      .catch((err) => {
                                        res.json([{ message: "failed" }]);
                                      });
                                  }
                                  Otp.deleteMany({
                                    number: user.number,
                                  }).exec();
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
