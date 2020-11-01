var app = require("express").Router();
const clientDetails = require("../Database/ClientDetails");
const { Pool } = require("pg");

var pool = new Pool(clientDetails);

app.post("/pay", async (req, res) => {
  var postgres = await pool.connect();
  await pay(postgres, req, res)(await postgres).release();
});

async function pay(postgres, req, res) {}

module.exports = app;
