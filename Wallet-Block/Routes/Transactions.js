const { model } = require("../Database/Schema/Block");

const app = require("express").Router();

app.post("/addTransactionBlock", (req, res) => {
  console.log("Adding transaction block....");
  console.log(req.body);
  res.send({ message: "doe" });
});

module.exports = app;
