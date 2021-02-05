const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

module.exports = class Database {
  pool = new Pool(clientDetails);

  getAllProducts = async () => {
    var postgres = await this.pool.connect();
    try {
      var products = await postgres.query("select * from products");
      return products.rows;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  addProducts = async (
    productID,
    productName,
    ownerID,
    discription,
    category,
    price,
    quantity,
    imageUrl,
    avaliableOn
  ) => {
    console.log(
      productID,
      productName,
      ownerID,
      discription,
      category,
      price,
      quantity,
      imageUrl,
      avaliableOn
    );
    var postgres = await this.pool.connect();
    try {
      postgres.query(
        `insert into products(
                           productID,
                           productName,
                           ownerID,
                           discription,
                           category,
                           price,
                           quantity,
                           imageUrl,
                           availableOn) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          productID,
          productName,
          ownerID,
          discription,
          category,
          price,
          quantity,
          imageUrl,
          avaliableOn,
        ]
      );

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  getProductWithID = () => {};

  getProducstWithMerchantID = () => {};
};
