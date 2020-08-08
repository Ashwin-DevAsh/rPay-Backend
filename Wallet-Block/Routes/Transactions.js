const { model } = require("../Database/Schema/Block");

const app = require("express").Router();

app.post("/addTransactionBlock", (req, res) => {
  console.log("Adding transaction block....");
  console.log(req);
  res.send({ message: "done" });
});

module.exports = app;
