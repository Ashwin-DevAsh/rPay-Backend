const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

module.exports = class Database {
  pool = new Pool(clientDetails);

  getAllproducts = async (req, res) => {
    try {
      var postgres = await postgres.query("select * from products");
      return postgres.rows;
    } catch (e) {
      return [];
    }
  };

  addProducts = async (
    productID,
    productName,
    ownerID,
    description,
    price,
    quantity,
    imageUrl,
    avaliableOn
  ) => {
    var postgres = await pool.connect();
    try {
      postgres.query(
        `insert into products(
                           productID,
                           productName,
                           ownerID,
                           description,
                           price,
                           quantity,
                           imageUrl,
                           avaliableOn
                           ) values($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          productID,
          productName,
          ownerID,
          description,
          price,
          quantity,
          imageUrl,
          avaliableOn,
        ]
      );

      return true;
    } catch (e) {
      return false;
    }
  };

  getProductWithID = () => {};

  getProducstWithMerchantID = () => {};
};
