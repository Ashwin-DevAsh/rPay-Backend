require("dotenv").config(".env");
const app = require("express").Router();
const Users = require("../Schemas/users");
const Otp = require("../Schemas/otp");
const jwt = require("jsonwebtoken");
const postgres = require("../Database/postgresql");

console.log(process.env.PRIVATE_KEY);

app.post("/addUser", (req, res) => {
  var user = req.body;
  console.log(user);

  if (
    !user.name ||
    !user.email ||
    !user.number ||
    !user.password ||
    !user.fcmToken
  ) {
    res.status(200).send([{ message: "error" }]);
    return;
  }

  Otp.findOne({ number: user.number })
    .exec()
    .then((otpDoc) => {
      if (otpDoc && otpDoc.verified) {
        Users.findOne({ number: user.number })
          .exec()
          .then((doc) => {
            postgres.query(
              "delete from info where id=$1;",
              [user.number],
              (err, result) => {
                postgres.query(
                  "insert into info values($1,$2,null,null)",
                  [user.number, user.fcmToken],
                  (err, result) => {
                    if (!err) {
                      postgres.query(
                        "insert into amount(id,balance) values($1,0)",
                        [user.number],
                        (err, result) => {
                          if (!err) {
                            if (doc) {
                              res.json([{ message: "User already exist" }]);
                            } else {
                              let userObject = new Users({
                                name: user.name,
                                number: user.number,
                                email: user.email,
                                password: user.password,
                              });
                              jwt.sign(
                                {
                                  name: user.name,
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

app.post("/updateFcmToken", (req, res) => {
  var object = req.body;
  if (!object.number || !object.fcmToken) {
    res.json([{ message: "missing parameter" }]);
  } else {
    postgres.query(
      "update info set fcmToken=$2 where id=$1",
      [object.number, object.fcmToken],
      (err, result) => {
        if (err) {
          res.json([{ message: "error" }]);
        } else {
          res.json([{ message: "done" }]);
        }
      }
    );
  }
});

app.get("/getUser", (req, res) => {
  if (req.query.number) {
    Users.find({ number: req.query.number }).then((doc) => {
      console.log(doc);
      res.status(200).send(doc);
    });
  } else {
    console.log(err);
    res.json([{ message: "failed" }]);
  }
});

app.post("/getUsersWithContacts", (req, res) => {
  var contacts = req.body["myContacts"];

  Users.find({}, ["name", "number", "email", "imageURL"])
    .where("number")
    .in(contacts)
    .exec()
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/getUsers", (req, res) => {
  Users.find({}, ["name", "number", "email", "imageURL"])
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

app.post("/changePassword", (req, res) => {
  console.log(req.header.get("token"));

  console.log("Changing password...");
  var data = req.body;
  console.log(data);
  if (!data.id || !data.oldPassword || !data.newPassword) {
    res.status(200).send({ message: "error" });
    return;
  }

  Users.findOne({ number: data.id })
    .exec()
    .then((docs) => {
      console.log("data = ", doc);

      if (docs.password == data.oldPassword) {
        Users.findOneAndUpdate(
          { number: data.id },
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
});

module.exports = app;
