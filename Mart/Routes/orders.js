const app = require("express").Router();
const OrdersController = require("../Controllers/ordersController");

var ordersController = new OrdersController();

app.post("/makeOrder", ordersController.makeOrder);

module.exports = app;
