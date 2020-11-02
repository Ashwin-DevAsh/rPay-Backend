require("dotenv").config(".env");
const express = require("express");
const Users = require("./Routes/Users");
const Stats = require("./Routes/Stats");
const Merchants = require("./Routes/Merchants");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const transactions = require("./Routes/Transactions");
const nodesAndBlocks = require("./Routes/nodesAndBlocks");
const adminRoute = require("./Routes/Admin");
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();

const PORT = process.env.PORT || 4500;

var rootId = `radmin@919876543210`;

(async () => {
  let postgres = new Pool(clientDetails);
  await postgres.connect();
  var result = await postgres.query(`select * from admins where email = $1`, [
    "rootAdmin@rpay.com",
  ]);

  var rootUser = result.rows;
  if (rootUser.length == 0) {
    var hash = await bcrypt.hash(process.env.ROOT_ADMIN_PASSWORD, 10);
    await postgres.query(
      "insert into admins(id,name,number,email,password,permissions) values($1,$2,$3,$4,$5,$6)",
      [
        rootId,
        "root",
        "919876543210",
        "rootAdmin@rpay.com",
        hash,
        [{ all: true }],
      ]
    );
    console.log("root user created....");
  } else {
    console.log("root user exist....");
  }

  await postgres.end();
})();

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(adminRoute);
app.use(transactions);
app.use(Merchants);
app.use(Users);
app.use(nodesAndBlocks);
app.use(Stats);

app.listen(PORT, () => {
  console.log("Listining on ", PORT);
});
