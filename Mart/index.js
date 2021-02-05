require("dotenv").config({ path: "./env/.env" });
const Auth = require("./Services/Auth");

const express = require("express");
const products = require("./Routes/products");

const bodyParser = require("body-parser");
const uploadPictures = require("./Routes/UploadPictures");

const app = express();

const cors = require("cors");

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(new Auth().isAuthenticated);
app.use(products);
app.use(uploadPictures);

app.listen(4600, () => {
  console.log("connecte at port 4600");
});
