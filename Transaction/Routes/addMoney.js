const app = require("express").Router();
const clientDetails = require("../Database/ClientDetails");
var dateFormat = require("dateformat");
var pool = new Pool(clientDetails);
var axios = require("axios");
var jwt = require("jsonwebtoken");

app.post("/addMoney", async (req, res) => {
  var postgres = await pool.connect();
  await addMoney(postgres, req, res)(await postgres).release();
});

async function addMoney(postgres, req, res) {
  var body = req.body;
  var amount = body.amount;
  var to = body.to;
  var from = body.from;

  if (!from || !amount || !to) {
    console.log("invalid body");
    res.send({ message: "failed" });
    return;
  }

  try {
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
    if (decoded.id != to.id) {
      console.log(decoded.id, "!=", to.id);
      res.send({ message: "failed" });
      return;
    }
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }

  var toAmmount = await postgres.query("select * from amount where id=$1", [
    to.id,
  ]);

  if (!toAmmount) {
    console.log("invalid user");
    res.send({ message: "failed" });
    return;
  }

  try {
    await postgres.query("begin");
    await postgres.query(
      "update amount set balance = balance + $1 where id = $2",
      [amount, to.id]
    );
    var transactionTime = dateFormat(new Date(), "dd-mm-yyyy hh:MM:ss");
    var transactionID = await postgres.query(
      `insert
     into transactions(
        transactionTime,
        fromMetadata,
        toMetadata,
        amount,
        isGenerated,
        iswithdraw)
      values($1,$2,$3,$4,$5,$6) returning transactionID`,
      [transactionTime, from, to, amount, true, false]
    );

    console.log(transactionID);

    var blockResult = await axios.post(
      "http://wallet-block:9000/addMoneyBlock/",
      {
        transactionID: transactionID,
        from: from,
        to: to,
        isGenerated: true,
        isWithdraw: false,
        amount: amount,
      }
    );
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
