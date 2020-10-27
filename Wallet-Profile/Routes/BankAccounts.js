const app = require("express").Router();
const jwt = require("jsonwebtoken");
const {Pool} = require("pg");
const clientDetails = require("../Database/ClientDetails")


app.post("/addBankAccount", async (req, res) => {
  var postgres = new Pool(clientDetails)
  postgres.connect()
  await addBankAccount(postgres,req, res, "users");
  postgres.end()

});
app.post("/deleteBankAccount", async(req, res) =>{
  var postgres = new Pool(clientDetails)
  postgres.connect()
  await deleteBankAccount(postgres,req, res, "users");
  postgres.end()

  }
);

app.post("/addBankAccountMerchant", async(req, res) => {
  var postgres = new Pool(clientDetails)
  postgres.connect()
  await addBankAccount(postgres,req, res, "merchants");
  postgres.end()

  }
);
app.post("/deleteBankAccountMerchant", async(req, res) =>{
  var postgres = new Pool(clientDetails)
  postgres.connect()
  await deleteBankAccount(postgres,req, res, "merchants");
  postgres.end()
  }
);

async function addBankAccount(postgres,req, res, tableName) {
    try{
     var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
    }catch(e){
      console.log(e)
      res.send({ message: "failed" });
      return
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
      `update ${tableName} set AccountInfo = array_append(AccountInfo,$1) where id=$2 `,
      [
        {
          holderName,
          accountNumber,
          ifsc,
          bankName,
        },
        id,
      ]
    );
    res.send({ message: "done" });
 
}

async function deleteBankAccount(postgres,req, res, tableName) {

  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "failed" });
     return
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
        await postgres.query(`select * from ${tableName} where id = $1`, [id])
      ).rows[0].accountinfo;

      var newBankAccounts = [];

      for (var i = 0; i < prevbankAccounts.length; i++) {
        if (
          prevbankAccounts[i].accountNumber !== accountNumber &&
          prevbankAccounts[i].ifsc !== ifsc
        ) {
          newBankAccounts.push(prevbankAccounts[i]);
        }
      }

      console.log(prevbankAccounts, newBankAccounts);

      await postgres.query(
        `update ${tableName} set AccountInfo = $2 where id = $1`,
        [id, newBankAccounts]
      );

      res.send({ message: "done" });
    } catch (err) {
      console.log(err);
      res.send({ message: "failed", err });
    }
}
module.exports = app;
