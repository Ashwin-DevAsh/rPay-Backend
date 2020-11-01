require("dotenv").config(".env");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pay = require("./Routes/pay");
const addMoney = require("./Routes/addMoney");
const withdraw = require("./Routes/withdraw");
const status = require("./Routes/withdraw");

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();

const PORT = process.env.PORT || 9500;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(pay);
app.use(status);
app.use(withdraw);
app.use(addMoney);

app.listen(PORT, () => {
  console.log("Listining on ", PORT);
});
