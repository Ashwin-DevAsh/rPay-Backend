const Database = require("../Services/Database");

class ProductsController {
  databaseService = new Database();

  getProducts = async (req, res) => {};

  getAllProducts = async (req, res) => {
    var allProducts = await database.getAllProducts();
    if (allProducts) {
      res.send({ message: "success", allProducts });
    } else {
      res.send({ message: "failed" });
    }
  };

  getProductsWithMerchantID = async (req, res) => {};

  getProductsWithProductID = async (req, res) => {};

  addProducts = async (req, res) => {
    var {
      productID,
      productName,
      ownerID,
      description,
      category,
      price,
      quantity,
      imageUrl,
      availableOn,
    } = req.body;

    console.log(req.body);

    console.log({
      productID,
      productName,
      ownerID,
      description,
      category,
      price,
      quantity,
      imageUrl,
      availableOn,
    });

    if (
      !productID ||
      !productName ||
      !description ||
      !category ||
      !ownerID ||
      !price ||
      !quantity ||
      !imageUrl ||
      !availableOn
    ) {
      var isAdded = await this.databaseService.addProducts(
        productID,
        productName,
        description,
        ownerID,
        price,
        quantity,
        imageUrl,
        availableOn
      );
      if (isAdded) {
        res.send({ message: "failed" });
      } else {
        res.send({ message: "success" });
      }
    } else {
      res.send({ message: "error" });
    }
  };
}

module.exports = ProductsController;
