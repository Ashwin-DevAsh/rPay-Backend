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
      price,
      quantity,
      imageUrl,
      availableOn,
    } = req.body;

    if (
      !productID ||
      !productName ||
      !description ||
      !ownerID ||
      !price ||
      !quantity ||
      !imageUrl ||
      !availableOn
    ) {
      var isAdded = await databaseService.addProduct(
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

export default ProductsController;
