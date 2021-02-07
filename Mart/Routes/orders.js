const app = require("express").Router();
const Auth = require("../Services/Auth");
const OrdersController = require("../Controllers/ordersController");

var ordersController = new OrdersController();

app.post("/makeOrder", new Auth().isTransAuth, ordersController.makeOrder);

app.get("/getMyOrders/:id", ordersController.getMyOrders);

app.post("/makeDelivery", ordersController.makeDelivery);

module.exports = app;
