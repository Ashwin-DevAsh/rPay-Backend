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
    var accountNumber = req.body.accountNumber;
    var ifsc = req.body.ifsc;

    console.log(id, accountNumber, ifsc);

    if (!id || !accountNumber || !ifsc) {
      res.send({ message: "failed" });
      return;
    }

    try {
      var prevbankAccounts = (
        await postgres.query(`select * from users where id = $1`, [id])
      ).rows[0].accountinfo;

      console.log(prevbankAccounts);

      var newBankAccounts = [];

      for (var i = 0; i < prevbankAccounts.length; i++) {
        if (
          prevbankAccounts.accountNumber != accountNumber &&
          prevbankAccounts.ifsc != ifsc
        ) {
          newBankAccounts.push(prevbankAccounts[0]);
        }
      }

      console.log(newBankAccounts);

      await postgres.query(
        `update ${tableName} set AccountInfo = $2 where id = $1`,
        [id, newBankAccounts]
      );

      res.send({ message: "done" });
    } catch (err) {
      console.log(err);
      res.send({ message: "failed", err });
    }
  });
}
module.exports = app;
