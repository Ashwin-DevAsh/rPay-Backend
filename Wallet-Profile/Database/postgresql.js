const { Client } = require("pg");
require("dotenv").config("../.env");

const client = new Client({
  host: "database",
  port: 5432,
  user: "postgres",
  // password: process.env.POSTGRES_PASSWORD,
  password: "2017PASS",
  database: "Rec_Wallet",
});

client.connect((err) => {
  console.log(err);
});

module.exports = client;
