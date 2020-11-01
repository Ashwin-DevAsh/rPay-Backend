var app = require("express").Router();
const { Pool } = require("pg");
var dateFormat = require("dateformat");
const clientDetails = require("../Database/ClientDetails");
var axios = require("axios");
var jwt = require("jsonwebtoken");

var pool = new Pool(clientDetails);

app.post("/withdraw", async (req, res) => {
  var postgres = await pool.connect();
  await withdraw(postgres, req, res)(await postgres).release();
});

async function withdraw(postgres, req, res) {
  var body = req.body;
  var amount = body.amount;
  var to = body.to;
  var from = body.from;

  try {
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
    if (decoded.id != from.id) {
      console.log(decoded.id, "!=", to.id);
      res.send({ message: "failed" });
      return;
    }
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }

  if (!from || !amount || !to) {
    console.log("invalid body");
    res.send({ message: "failed" });
    return;
  }

  var fromAmmount = await postgres.query("select * from amount where id=$1", [
    from.id,
  ]);

  if (fromAmmount) {
    console.log("invalid users");
    res.send({ message: "failed" });
    return;
  }

  if (amount <= 0) {
    console.log("invalid amount");
    res.send({ message: "failed" });
    return;
  }

  if (fromAmmount < amount) {
    console.log("insufficient balance");
    res.send({ message: "failed" });
    return;
  }

  try {
    await postgres.query("begin");
    await postgres.query(
      "update amount set balance = balance - $1 where id = $2",
      [amount, from.id]
    );

    var transactionTime = dateFormat(new Date(), "mm-dd-yyyy hh:MM:ss");
    var transactionID = (
      await postgres.query(
        `insert
		           into transactions(
					   transactionTime,
					   fromMetadata,
					   toMetadata,
					   amount,
					   isGenerated,
					   iswithdraw)
				    values($1,$2,$3,$4,$5,$6) returning transactionID`,
        [transactionTime, from, to, amount, false, true]
      )
    ).rows[0]["transactionid"];

    console.log(transactionID);

    var blockResult = await axios.post("http://block:9000/addWithdrawBlock/", {
      transactionID: transactionID,
      senderBalance: fromAmmount,
      from: from,
      to: to,
      isGenerated: false,
      isWithdraw: true,
      amount: amount,
    });
    if ((blockResult.data["message"] = "done")) {
      await postgres.query("commit");
      res.send({ message: "done" });
    }
  } catch (e) {
    console.log(e);
    await postgres.query("rollback");
    res.send({ message: "failed" });
  }
}

module.exports = app;
