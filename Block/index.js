require("dotenv").config("./env/.env");

const express = require("express");
const transactionBlocks = require("./Routes/block");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({ message: "wellcome to rec-wallet block" });
});

app.use(transactionBlocks);

app.listen(9000, () => {
  console.log("listing on 9000....");
});
