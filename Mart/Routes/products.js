const app = require("express").Router();
const ProductsController = require("../Controllers/productsController");

var productsController = new ProductsController();

app.post("/updateProduct", productsController.updateProduct);

app.post("/addProducts", productsController.addProducts);

app.post("/deleteProduct", productsController.deleteProduct);

app.get("/getAllProducts", productsController.getAllProducts);

module.exports = app;
