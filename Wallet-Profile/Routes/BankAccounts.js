const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/postgresql");

app.post("/addBankAccount", (req, res) => addBankAccount(req, res, "users"));
app.post("/deleteBankAccount", (req, res) =>
  deleteBankAccount(req, res, "users")
);

app.post("/addBankAccountMerchant", (req, res) =>
  addBankAccount(req, res, "merchants")
);
app.post("/deleteBankAccountMerchant", (req, res) =>
  deleteBankAccount(req, res, "merchants")
);

function addBankAccount(req, res, tableName) {
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, async function (
    err,
    decoded
  ) {
    if (err) {
      console.log(err);
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

function deleteBankAccount(req, res, tableName) {
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, async function (
    err,
    decoded
  ) {
    if (err) {
      console.log(err);
      res.send({ message: "failed" });
      return;
    }

    var id = req.body.id;
    var bankAccounts = req.body.bankAccounts;

    if (!id || !bankAccounts) {
      res.send({ message: "failed" });
      return;
    }

    await postgres.query(`update ${tableName} set AccountInfo = $1`, [
      bankAccounts,
    ]);
  });
}
module.exports = app;
