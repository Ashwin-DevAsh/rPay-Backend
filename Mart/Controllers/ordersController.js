const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const TransactionsService = require("../Services/TransactionService");
var sendNotification = require("../Services/NotificationServices");

module.exports = class OrdersController {
  transactionsService = new TransactionsService();
  pool = new Pool(clientDetails);
  makeOrder = async (req, res) => {
    var { products, transactionData, amount } = req.body;
    console.log(req.body);
    if ((!products, !transactionData, !amount)) {
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
