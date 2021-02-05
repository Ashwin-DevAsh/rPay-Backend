const app = require("express").Router();
const ProductsController = require("../Controllers/productsController");

var productsController = new ProductsController();

app.post("/addProducts", productsController.addProducts);

app.post("/getAllProducts", productsController.getAllProducts);

module.exports = app;
