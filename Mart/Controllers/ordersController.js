const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const TransactionsService = require("../Services/TransactionService");
const jwt = require("jsonwebtoken");

module.exports = class OrdersController {
  transactionsService = new TransactionsService();
  pool = new Pool(clientDetails);
  makeOrder = async (req, res) => {
    var { products, transactionData, amount } = req.body;

    try {
      var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
      if (decoded.id != transactionData.from.id) {
        console.log(decoded.id + from.id);
        res.send({ message: "failed" });
        return;
      }
    } catch (e) {
      console.log(e);
      res.send({ message: "failed" });
      return;
    }

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
