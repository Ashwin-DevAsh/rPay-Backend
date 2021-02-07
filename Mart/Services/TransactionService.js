const dateFormat = require("dateformat");
const axios = require("axios");
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const sendNotification = require("../Services/NotificationServices");

module.exports = class TranslationService {
  pool = new Pool(clientDetails);

  payToMart = async (postgres, transactionData) => {
    var amount = transactionData.amount;
    var to = transactionData.to;
    var from = transactionData.from;

    var fromAmmount = (
      await postgres.query("select * from users where id=$1 for update", [
        from.id,
      ])
    ).rows[0];

    if (!fromAmmount) {
      return false;
    }

    if (amount <= 0) {
      console.log("invalid amount");
      return false;
    }

    if (parseInt(fromAmmount["balance"]) < parseInt(amount)) {
      console.log("insufficient balance");
      return false;
    }

    try {
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
        return { transactionID };
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  payToMerchant = async (postgres, from, merchantID, transactionID, amount) => {
    var toAmmount = (
      await postgres.query("select * from users where id=$1 for update", [
        merchantID,
      ])
    ).rows[0];
    var to = {
      id: toAmmount["id"],
      name: toAmmount["accountname"],
      number: toAmmount["number"],
      email: toAmmount["email"],
    };

    var fromAmmount = (
      await postgres.query(
        "select * from transactions where transactionid=$1",
        [transactionID]
      )
    ).rows[0];

    if (!toAmmount || !fromAmmount) {
      console.log("invalid");
      return false;
    }

    if (parseInt(fromAmmount["amount"]) < parseInt(amount)) {
      console.log("insufficient balance");
      res.send({ message: "failed" });
      return false;
    }

    try {
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
        return { transactionID, to };
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  placeOrder = async (
    postgres,
    fromTransactionID,
    toTransactionID,
    products,
    orderdBy,
    amount
  ) => {
    var postgres = await this.pool.connect();
    var transactionTime = dateFormat(new Date(), "mm-dd-yyyy hh:MM:ss");
    try {
      var orderData = (
        await postgres.query(
          `insert into orders(
                        status,
                        amount,
                        orderdBy ,
                        timestamp ,
                        products ,
                        paymentMetadata)
                        values($1,$2,$3,$4,$5,$6) returning *`,
          [
            "pending",
            amount,
            orderdBy,
            transactionTime,
            products,
            { fromTransactionID, toTransactionID },
          ]
        )
      ).rows[0];
      return orderData;
    } catch (e) {
      return false;
    }
  };

  makeOrder = async (transactionData, products, amount) => {
    var postgres = await this.pool.connect();
    await postgres.query("begin");
    var isPayToMartDone = await this.payToMart(postgres, transactionData);
    if (!isPayToMartDone) {
      await postgres.query("rollback");
      postgres.release();
      console.log("payment failed");
      return false;
    }
    var isPaymerchantDone = await this.payToMerchant(
      postgres,
      transactionData.to,
      products[0].product.productOwner,
      isPayToMartDone.transactionID,
      amount
    );
    if (!isPaymerchantDone) {
      await postgres.query("rollback");
      postgres.release();

      console.log("payment merchant failed");
      return false;
    }
    var isPlacedOrder = await this.placeOrder(
      postgres,
      isPayToMartDone.transactionID,
      isPaymerchantDone.transactionID,
      products,
      transactionData.from,
      amount
    );

    if (!isPlacedOrder) {
      await postgres.query("rollback");
      postgres.release();
      console.log("payment order failed");
      return false;
    }
    await postgres.query("commit");
    postgres.release();

    var { from, to } = transactionData;

    sendNotification(
      from.id,
      `rmartPayment,${to.name},${to.id},${amount},${to.email}`
    );

    var { from, to } = { from: transactionData.to, to: isPaymerchantDone.to };

    sendNotification(
      to.id,
      `receivedMoney,${from.name},${from.id},${amount},${from.email}`
    );

    return isPlacedOrder;
  };
};
