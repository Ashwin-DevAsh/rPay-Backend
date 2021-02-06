const dateFormat = require("dateformat");
const axios = require("axios");
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const sendNotification = require("../Services/NotificationServices");

module.exports = class TranslationService {
  pool = new Pool(clientDetails);
  payToMart = async (transactionData) => {
    var postgres = await this.pool.connect();
    var amount = transactionData.amount;
    var to = transactionData.to;
    var from = transactionData.from;

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

    if (fromAmmount["balance"] < amount) {
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
        sendNotification(
          from.id,
          `rmartPayment,${to.name},${to.id},${amount},${to.email}`
        );
        return transactionID;
      }
    } catch (e) {
      console.log(e);
      await postgres.query("rollback");
      postgres.release();
      return false;
    }
  };

  payToMerchant = async (from, merchantID, transactionID) => {
    var postgres = await this.pool.connect();
    var toAmmount = await postgres.query(
      "select * from users where id=$1 for update",
      [merchantID]
    );

    var to = {
      id: toAmmount["id"],
      name: toAmmount["accountname"],
      number: toAmmount["number"],
      email: toAmmount["email"],
    };

    var fromAmmount = await postgres.query(
      "select * from transactions where transactionid=$1",
      [transactionID]
    );

    if (!toAmmount || !fromAmmount) {
      console.log("invalid");
      postgres.release();
      return false;
    }

    if (fromAmmount["amount"] < amount) {
      console.log("insufficient balance");
      res.send({ message: "failed" });
      postgres.release();
      return false;
    }

    try {
      await postgres.query("begin");

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
        postgres.release();
        return transaction;
      }
    } catch (e) {
      console.log(e);
      await postgres.query("rollback");
      postgres.release();
      return false;
    }
  };
};
