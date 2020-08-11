const app = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const postgres = require("../Database/Connections/pgConnections");

app.post("/login", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  if (email && password) {
    var admin = (
      await postgres.query("select * from admins where email = $1", [email])
    ).rows;

    console.log(admin);

    if (admin.length == 0) {
      res.send({ message: "invalid admin" });
      return;
    }

    var name = admin.name;
    var number = admin.number;
    var permissions = admin.permissions;

    bcrypt.compare(password, admin.password, async (err, isMatch) => {
      if (err) {
        console.log(err);
        res.send({ message: "error", err });
        return;
      }
      if (!isMatch) {
        res.send({ message: "invalid password" });
        return;
      }

      jwt.sign(
        { name, email, number, permissions },
        process.env.PRIVATE_KEY,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) {
            console.log(err);
            res.send({ message: err });
          } else {
            res.send({
              message: "done",
              token,
              name,
              number,
              email,
              permissions,
            });
          }
        }
      );
    });
  } else {
    res.send({
      message: "missing username or password",
    });
  }
});

module.exports = app;
