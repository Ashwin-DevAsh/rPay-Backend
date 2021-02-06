const app = require("express").Router();
const Auth = require("../Services/Auth");
const OrdersController = require("../Controllers/ordersController");

var ordersController = new OrdersController();

app.post("/makeOrder", new Auth().isTransAuth, ordersController.makeOrder);

module.exports = app;
