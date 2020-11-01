var app = require("express").Router();
const clientDetails = require("../Database/ClientDetails");
const { Pool } = require("pg");
var jwt = require("jsonwebtoken");
var axios = require("axios");
var dateFormat = require("dateformat");
var sendNotification = require("./fcm");
var pool = new Pool(clientDetails);

app.post("/sendMessage", async (req, res) => {
  var postgres = await pool.connect();
  await pay(postgres, req, res);
  (await postgres).release();
});

async function sendMessage(postgres, req, res) {
  var body = req.body;
  var message = body.message;
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

  try {
    await postgres.query("begin");
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
					   iswithdraw,message)
				    values($1,$2,$3,$4,$5,$6) returning transactionID`,
        [transactionTime, from, to, 0, false, false, message]
      )
    ).rows[0]["transactionid"];

    console.log(transactionID);

    res.send({
      message: "done",
    });
    sendNotification(
      to.id,
      `message,${from.name},${from.id},${amount},${from.email}`
    );
  } catch (e) {
    console.log(e);
    await postgres.query("rollback");
    res.send({ message: "failed" });
  }
}

module.exports = app;
