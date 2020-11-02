const app = require("express").Router();
const jwt = require("jsonwebtoken");

const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

app.get("/getNodes", async (req, res) => {
  var postgres = new Pool(clientDetails);
  await postgres.connect();
  await getNodes(postgres, req, res);
  await postgres.end();
});

app.get("/getBlocks", async (req, res) => {
  var postgres = new Pool(clientDetails);
  await postgres.connect();
  await getBlocks(postgres, req, res);
  await postgres.end();
});

var getNodes = async (postgres, req, res) => {
  try {
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }
  if (decoded.name) {
    postgres
      .query("select * from info")
      .then((datas) => {
        console.log(datas.rows[0]);
        res.send(datas);
      })
      .catch((e) => {
        console.error(e);
        res.send({ message: "error", e });
      });
  }
};

var getBlocks = async (postgres, req, res) => {
  try {
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }

  if (decoded.name) {
    postgres
      .query("select * from blocks order by timestamp desc")
      .then((datas) => {
        res.send(datas);
      })
      .catch((e) => {
        console.error(e);
        res.send({ message: "error", e });
      });
  }
};

module.exports = app;
