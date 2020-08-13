const app = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const postgres = require("../../Wallet-Admin/Database/Connections/pgConnections");

app.post("/addBankAccount", (req, res) => addBankAccount(req, res, "users"));
app.post("/addBankAccountMerchant", (req, res) =>
  addBankAccount(req, res, "merchants")
);

function addBankAccount(req, res, tableName) {
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, async function (
    err,
    decoded
  ) {
    if (err) {
      res.send({ message: "failed" });
      return;
    }

    var id = req.body.id;
    var holderName = req.body.holderName;
    var accountNumber = req.body.accountNumber;
    var ifsc = req.body.ifsc;
    var bankName = req.body.bankName;

    if (!id || !holderName || !accountNumber || !ifsc || !bankName) {
      res.send({ message: "failed" });
      return;
    }

    await postgres.query(
      `update ${tableName} set AccountInfo = array_append(AccountInfo,$1)`,
      [
        {
          holderName,
          accountNumber,
          ifsc,
          bankName,
        },
      ]
    );
    res.send({ message: "done" });
  });
}

module.exports = app;
