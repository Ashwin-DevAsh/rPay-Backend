const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");
const Users = require("../Database/Schema/Users");

app.get("/getUsers", (req, res) => {
  var token = req.get("token");
  console.log("Getting Users");

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      Users.find({})
        .exec()
        .then((doc) => {
          res.send(doc);
        })
        .catch((e) => {
          res.send({ err: e });
        });
    }
  });
});

module.exports = app;
