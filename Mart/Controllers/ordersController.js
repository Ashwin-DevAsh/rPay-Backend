class OrdersController {
  makeOrder = async (req, res) => {
    var { products, transactionData, amount } = req.body;
    if ((!products, !transactionData, !amount)) {
      res.send({ message: "failed" });
      return;
    }
  };
}
