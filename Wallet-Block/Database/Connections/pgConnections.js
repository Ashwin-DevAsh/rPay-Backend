const { Client } = require("pg");
require("dotenv").config("../../.env");

console.log(process.env.POSTGRES_PASSWORD);

const client = new Client({
  host: "database",
  port: 5432,
  user: "postgres",
  password: "2017PASS",
  database: "Rec_Wallet",
});

client.connect((err) => {
  console.log(err);
});

module.exports = client;
