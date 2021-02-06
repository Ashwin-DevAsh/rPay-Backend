var app = require("express").Router();
const clientDetails = require("../Database/ClientDetails");
const { Pool } = require("pg");
var jwt = require("jsonwebtoken");
var axios = require("axios");
var dateFormat = require("dateformat");
var sendNotification = require("./fcm");
var pool = new Pool(clientDetails);
var dateFormat = require("dateformat");

app.post("/pay", async (req, res) => {
  var postgres = await pool.connect();
  await pay(postgres, req, res);
  (await postgres).release();
});

async function pay(postgres, req, res) {
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

  var toAmmount = await postgres.query(
    "select * from users where id=$1 for update",
    [to.id]
  );

  var fromAmmount = await postgres.query(
    "select * from users where id=$1 for update",
    [from.id]
  );

  if (!toAmmount || !fromAmmount) {
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
      "update users set balance = balance - $1 where id = $2",
      [amount, from.id]
    );
    await postgres.query(
      "update users set balance = balance + $1 where id = $2",
      [amount, to.id]
    );
    var transactionTime = dateFormat(new Date(), "mm-dd-yyyy hh:MM:ss");
    var transactionID = (
      await postgres.query(
        `insert into transactions(
					   transactionTime,
					   fromMetadata,
					   toMetadata,
					   amount,
					   isGenerated,
					   iswithdraw)
				    values($1,$2,$3,$4,$5,$6) returning transactionID`,
        [transactionTime, from, to, amount, false, false]
      )
    ).rows[0]["transactionid"];

    console.log(transactionID);

    var blockResult = await axios.post(
      "http://block:9000/addTransactionBlock/",
      {
        transactionID: transactionID,
        from: from,
        to: to,
        isGenerated: false,
        isWithdraw: false,
        amount: amount,
      }
    );
    if ((blockResult.data["message"] = "done")) {
      await postgres.query("commit");
      res.send({
        message: "done",
        transactionid: transactionID,
        transactiontime: transactionTime,
      });
      sendNotification(
        to.id,
        `receivedMoney,${from.name},${from.id},${amount},${from.email}`
      );
    }
  } catch (e) {
    console.log(e);
    await postgres.query("rollback");
    res.send({ message: "failed" });
  }
}

module.exports = app;
