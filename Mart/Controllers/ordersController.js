const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const TransactionsService = require("../Services/TransactionService");
const jwt = require("jsonwebtoken");

module.exports = class OrdersController {
  transactionsService = new TransactionsService();
  pool = new Pool(clientDetails);
  makeOrder = async (req, res) => {
    var { products, transactionData, amount } = req.body;

    if (!products || !transactionData || !amount) {
      console.log("Invalid body");
      res.send({ message: "failed" });
      return;
    }

    var isPayToMartDone = await this.transactionsService.payToMart(
      transactionData,
      req
    );

    if (!isPayToMartDone) {
      console.log("payment failed");
      res.send({ message: "failed" });
      return;
    }

    var isPaymerchantDone = await this.transactionsService.payToMerchant(
      transactionData.to,
      products[0].productOwner,
      isPayToMartDone
    );

    if (!isPaymerchantDone) {
      console.log("payment merchant failed");
      res.send({ message: "failed" });
      return;
    }

    res.send({ message: "done" });
    return;
  };
};
