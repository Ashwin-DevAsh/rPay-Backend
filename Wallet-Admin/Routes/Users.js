const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");
const Users = require("../Database/Schema/Users");

app.get("/getUsers", (req, res) => {
  console.log("Getting Users");
  Users.find({})
    .exec()
    .then((doc) => {
      res.send(doc);
    })
    .catch((e) => {
      res.send({ err: e });
    });
});

module.exports = app;
