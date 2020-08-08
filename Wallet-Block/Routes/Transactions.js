const { model } = require("../Database/Schema/Block");

const app = require("express").Router();

app.post("/addTransactionBlock", (req, res) => {
  console.log("Adding transaction block....");
  console.log(req.body);
  res.send({ message: "done" });
});

app.post("/addMoneyBlock", (req, res) => {
  console.log("Adding money block....");
  console.log(req.body);
  res.send({ message: "done" });
});

app.post("/addUserBlock", (req, res) => {
  console.log("Adding user block....");
  console.log(req.body);
  res.send({ message: "done" });
});

module.exports = app;
