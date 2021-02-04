const app = require("express").Router();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

var pool = new Pool(clientDetails);

app.get("/getTransactions", async (req, res) => {
  var postgres = await pool.connect();
  await getTransactions(postgres, req, res);
  await postgres.release();
});

var getTransactions = async (postgres, req, res) => {
  try {
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }

  if (decoded.name) {
    postgres
      .query("select * from transactions where amount > 0")
      .then((datas) => {
        console.log(datas.rows[0]);
        res.send(datas);
      })
      .catch((e) => {
        console.error(e.stack);
        res.send(e);
      });
  }
};

module.exports = app;
