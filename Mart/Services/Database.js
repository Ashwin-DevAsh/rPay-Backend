const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

module.exports = class Database {
  pool = new Pool(clientDetails);

  getAllProducts = async () => {
    var postgres = await this.pool.connect();
    try {
      var products = await postgres.query("select * from products");
      postgres.release();
      return products.rows;
    } catch (e) {
      postgres.release();
      console.log(e);
      return [];
    }
  };

  deleteProduct = async (productID) => {
    var postgres = await this.pool.connect();
    try {
      postgres.query(`delete from products where productID = $1`, [productID]);
      postgres.release();

      return true;
    } catch (e) {
      postgres.release();
      console.log(e);
      return false;
    }
  };

  updateProduct = async (
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
    var postgres = await this.pool.connect();
    try {
      postgres.query(
        `update products set
                           
                           productName =$2,
                           ownerID = $3,
                           discription = $4,
                           category = $5,
                           price = $6,
                           quantity = $7,
                           imageUrl = $8,
                           availableOn = $9 where productID = $1`,
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
      postgres.release();
      return true;
    } catch (e) {
      postgres.release();

      console.log(e);
      return false;
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
      postgres.release();

      return true;
    } catch (e) {
      postgres.release();

      console.log(e);
      return false;
    }
  };

  getMyOrders = async (id) => {
    var postgres = await this.pool.connect();

    try {
      var orders = (
        await postgres.query(
          `select * from orders  where cast(orderdby->>'id' as varchar) = $1`,
          [id]
        )
      ).rows;
      postgres.release();
      return orders;
    } catch (e) {
      postgres.release();
      console.log(e);
      return [];
    }
  };

  getAllOrders = async (id) => {
    var postgres = await this.pool.connect();

    try {
      var orders = (await postgres.query(`select * from orders`, [id])).rows;
      postgres.release();
      return orders;
    } catch (e) {
      postgres.release();
      console.log(e);
      return [];
    }
  };

  updateStatus = async (id) => {
    var postgres = await this.pool.connect();

    try {
      var orders = (
        await postgres.query(`select * from orders  where orederid = $1`, [id])
      ).rows[0];
      console.log(id, orders);
      if (!orders) {
        postgres.release();
        return "invalid token";
      }
      if (orders.status == "pending") {
        await postgres.query(
          `update orders set status = 'delivered' where orederid = $1`,
          [id]
        );
        postgres.release();
        return "success";
      } else {
        postgres.release();
        return "already expeired";
      }
    } catch (e) {
      postgres.release();
      return "failed";
    }
  };
};
