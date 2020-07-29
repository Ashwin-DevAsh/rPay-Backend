require("dotenv").config(".env");
const app = require("express").Router();
const Users = require("../Schemas/users");
const Otp = require("../Schemas/otp");
const jwt = require("jsonwebtoken");
const postgres = require("../Database/postgresql");

console.log(process.env.PRIVATE_KEY);

app.post("/addUser", async (req, res) => {
  var user = req.body;
  console.log(user);
  if (
    !user.name ||
    !user.email ||
    !user.number ||
    !user.password ||
    !user.fcmToken ||
    !user.qrCode
  ) {
    res.status(200).send([{ message: "error" }]);
    return;
  }

  try {
    var userID = `rpay@${user.number}`;
    var otpDoc = await Otp.findOne({ number: user.number }).exec();

    if (!otpDoc || !!otpDoc.verified) {
      res.json([{ message: "number not verified" }]);
      return;
    }

    var doc = await Users.findOne({
      $or: [{ number: user.number }, { email: user.email }],
    }).exec();

    if (doc) {
      res.json([{ message: "User already exist" }]);
      return;
    }

    await postgres.query("delete from info where id=$1;", [userID]);
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
    });

    var token = await jwt.sign(
      {
        name: user.name,
        id: userID,
        number: user.number,
        email: user.email,
      },
      process.env.PRIVATE_KEY
    );
    userObject
      .save()
      .then((result) => {
        console.log(token);
        res.json([{ message: "done", token }]);
      })
      .catch((err) => {
        res.json([{ message: "failed" }]);
      });
  } catch (e) {
    res.json([{ message: "failed", err: e }]);
  }
});

app.post("/updateFcmToken", (req, res) => {
  var object = req.body;
  if (!object.id || !object.fcmToken) {
    res.json([{ message: "missing parameter" }]);
  } else {
    postgres.query(
      "update info set fcmToken=$2 where id=$1",
      [object.id, object.fcmToken],
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
  Users.find({}, ["name", "number", "email", "imageURL", "id"])
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

module.exports = app;
