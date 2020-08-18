require("dotenv").config(".env");

const express = require("express");

const bodyParser = require("body-parser");
const authEndPoint = require("./Routes/Auth");
const userEndPoint = require("./Routes/User");
const merchantEndPoint = require("./Routes/Merchants");
const recovery = require("./Routes/Recovery");
const bankAccounts = require("./Routes/BankAccounts");
const uploadPictures = require("./Routes/UploadPictures");
const postgresql = require("./Database/postgresql");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({ Message: "Welcome to rec wallet" });
});

app.use(userEndPoint);
app.use(authEndPoint);
app.use(merchantEndPoint);
app.use(recovery);
app.use(bankAccounts);
app.use(uploadPictures);

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
        await postgresql.query("select * from amount where id=$1", [id])
      ).rows[0].balance;

      var transactions = (
        await postgresql.query(
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

app.listen(8000, () => {
  console.log("connecte at port 8000");
});
