const Database = require("../Services/Database");

class ProductsController {
  databaseService = new Database();

  getProducts = async (req, res) => {};

  getAllProducts = async (req, res) => {
    var allProducts = await this.databaseService.getAllProducts();
    if (allProducts) {
      res.send({ message: "success", allProducts });
    } else {
      res.send({ message: "failed" });
    }
  };

  updateProduct = async (req, res) => {
    var {
      productID,
      productName,
      ownerID,
      discription,
      category,
      price,
      quantity,
      imageUrl,
      availableOn,
    } = req.body;

    if (
      !productID ||
      !productName ||
      !discription ||
      !category ||
      !ownerID ||
      !price ||
      !quantity ||
      !imageUrl ||
      !availableOn
    ) {
      res.send({ message: "error" });
    } else {
      var isUpdated = await this.databaseService.updateProduct(
        productID,
        productName,
        ownerID,
        discription,
        category,
        price,
        quantity,
        imageUrl,
        availableOn
      );
      if (isUpdated) {
        res.send({ message: "success" });
      } else {
        res.send({ message: "failed" });
      }
    }
  };

  addProducts = async (req, res) => {
    var {
      productID,
      productName,
      ownerID,
      discription,
      category,
      price,
      quantity,
      imageUrl,
      availableOn,
    } = req.body;

    if (
      !productID ||
      !productName ||
      !discription ||
      !category ||
      !ownerID ||
      !price ||
      !quantity ||
      !imageUrl ||
      !availableOn
    ) {
      res.send({ message: "error" });
    } else {
      var isAdded = await this.databaseService.addProducts(
        productID,
        productName,
        ownerID,
        discription,
        category,
        price,
        quantity,
        imageUrl,
        availableOn
      );
      if (isAdded) {
        res.send({ message: "success" });
      } else {
        res.send({ message: "failed" });
      }
    }
  };
}

module.exports = ProductsController;
