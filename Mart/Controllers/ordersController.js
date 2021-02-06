const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const TransactionsService = require("../Services/TransactionService");
const jwt = require("jsonwebtoken");

module.exports = class OrdersController {
  transactionsService = new TransactionsService();
  pool = new Pool(clientDetails);
  makeOrder = async (req, res) => {
    try {
      var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
      if (decoded.id != from.id) {
        res.send({ message: "failed" });
      }
    } catch (e) {
      res.send({ message: "failed" });
    }

    var { products, transactionData, amount } = req.body;

    if (!products || !transactionData || !amount) {
      console.log("Invalid body");
      res.send({ message: "failed" });
      return;
    } else {
      var isPayToMartDone = await this.transactionsService.payToMart(
        transactionData,
        req
      );
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
};
