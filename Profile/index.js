require("dotenv").config({ path: "./env/.env" });

const express = require("express");

const bodyParser = require("body-parser");
const authEndPoint = require("./Routes/Auth");
const userEndPoint = require("./Routes/User");
const merchantEndPoint = require("./Routes/Merchants");
const recovery = require("./Routes/Recovery");
const bankAccounts = require("./Routes/BankAccounts");
const uploadPictures = require("./Routes/UploadPictures");
const init = require("./Routes/init");

process.env.TZ = "Asia/Kolkata";
const app = express();

const cors = require("cors");

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({ Message: "Welcome to rec wallet" });
});

app.use(userEndPoint);
app.use(authEndPoint);
app.use(merchantEndPoint);
app.use(recovery);
app.use(bankAccounts);
app.use(uploadPictures);
app.use(init);

app.listen(8000, () => {
  console.log("connecte at port 8000");
});
