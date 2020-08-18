const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/postgresql");

app.get("/init/:id", (req, res) => {
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, async function (
    err,
    decoded
  ) {
    if (err) {
      res.status(200).send({ message: "error" });
      return;
    }

    var id = req.params.id;
    if (!id) {
      res.status(200).send({ message: "error" });
      return;
    }

    try {
      var balance = (
        await postgres.query("select * from amount where id=$1", [id])
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
                cast(fromMetadata->>'Id' as varchar) = $1 or cast(toMetadata->>'Id' as varchar) = $1`,
          [id]
        )
      ).rows;

      var merchants = (
        await postgres.query(
          "select name,number,email,id,storeName from merchants where status='active'"
        )
      ).rows;

      res.json({ message: "done", balance, transactions, merchants });
    } catch (err) {
      console.log(err);
      res.json({ message: "failed" });
    }
  });
});

module.exports = app;
