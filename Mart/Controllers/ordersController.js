const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const jwt = require("jsonwebtoken");
const dateFormat = require("dateformat");
const axios = require("axios");

module.exports = class OrdersController {
  pool = new Pool(clientDetails);
  makeOrder = async (req, res) => {
    var { products, transactionData, amount } = req.body;
    console.log(req.body);
    if ((!products, !transactionData, !amount)) {
      console.log("Invalid body");
      res.send({ message: "failed" });
      return;
    } else {
      var isPayToMartDone = await this.payToMart(transactionData, req);
      if (isPayToMartDone) {
        res.send({ message: "done" });
        return;
      } else {
        console.log("payment failed");
        res.send({ message: "failed" });
        return;
      }
    }
  };

  payToMart = async (transactionData, req) => {
    var postgres = await this.pool.connect();
    var amount = transactionData.amount;
    var to = transactionData.to;
    var from = transactionData.from;

    try {
      var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
      if (decoded.id != from.id) {
        postgres.release();
        return false;
      }
    } catch (e) {
      console.log("token error");
      console.log(e);
      postgres.release();
      return false;
    }

    if (!from || !amount || !to) {
      console.log("invalid body");
      postgres.release();
      return false;
    }

    var fromAmmount = await postgres.query(
      "select * from users where id=$1 for update",
      [from.id]
    );

    if (!fromAmmount) {
      postgres.release();
      return false;
    }

    if (amount <= 0) {
      console.log("invalid amount");
      postgres.release();
      return false;
    }

    if (fromAmmount < amount) {
      console.log("insufficient balance");
      postgres.release();
      return false;
    }

    try {
      await postgres.query("begin");
      await postgres.query(
        "update users set balance = balance - $1 where id = $2",
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
				    values($1,$2,$3,$4,$5,$6) returning *`,
          [transactionTime, from, to, amount, false, false]
        )
      ).rows[0]["transactionid"];

      console.log(transactionID);

      var blockResult = await axios.post(
        "http://block:9000/addWithdrawBlock/",
        {
          transactionID: transactionID,
          senderBalance: fromAmmount,
          from: from,
          to: to,
          isGenerated: false,
          isWithdraw: true,
          amount: amount,
        }
      );
      if ((blockResult.data["message"] = "done")) {
        await postgres.query("commit");
        postgres.release();
        return transactionID;
      }
    } catch (e) {
      console.log(e);
      await postgres.query("rollback");
      postgres.release();
      return false;
    }
  };
};
