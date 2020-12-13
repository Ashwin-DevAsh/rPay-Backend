const app = require("express").Router();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

var pool = new Pool(clientDetails);

app.get("/init/:id", async (req, res) => {
  var postgres = await pool.connect();
  await init(postgres, req, res);
  postgres.release();
});

var init = async (postgres, req, res) => {
  try {
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }

  var id = req.params.id;
  if (!id) {
    res.status(200).send({ message: "error" });
    return;
  }

  try {
    var balance = (
      await postgres.query("select * from users where id=$1", [id])
    ).rows[0].balance;

    var transactions = (
      await postgres.query(
        `select TransactionId,
                TransactionTime,
                fromMetadata,
                toMetadata,
                amount,
                isGenerated,
                isWithdraw,
                to_timestamp(transactionTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
             from 
                transactions 
            where 
                (cast(fromMetadata->>'id' as varchar) = $1 or cast(toMetadata->>'id' as varchar) = $1) and amount > 0`,
        [id]
      )
    ).rows;

    var merchants = (
      await postgres.query(
        "select accountname,number,email,id,storeName from users where isMerchantAccount = true status='active'"
      )
    ).rows;

    res.json({ message: "done", balance, transactions, merchants });
  } catch (err) {
    console.log(err);
    res.json({ message: "failed" });
  }
};

module.exports = app;
