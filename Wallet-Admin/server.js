require("dotenv").config(".env");
const express = require("express");
const mongodb = require("./Database/Connections/connection");
const Merchant = require("./Database/Schema/Merchant");
const Admin = require("./Database/Schema/Admin");
const Users = require("./Routes/Users");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const transactions = require("./Routes/Transactions");

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const adminRoute = require("./Routes/Admin");

const app = express();

const PORT = process.env.PORT || 4500;

Admin.findOne({ number: "919551574355" })
  .exec()
  .then((doc) => {
    console.log(doc);

    if (!doc) {
      bcrypt.hash(process.env.ROOT_ADMIN_PASSWORD, 10, function (err, hash) {
        if (err) {
          console.log(err);
          return;
        }
        let adminObject = new Admin({
          name: "DevAsh",
          number: "919551574355",
          email: "2017ashwin@gmail.com",
          password: hash,
          imageURL: "12345678",
          accessTo: ["*"],
        });

        adminObject
          .save()
          .then(() => {
            console.log("root user created...");
          })
          .catch((err) => {
            console.log(err);
          });
      });
    } else {
      console.log("root user exist...");
    }
  });

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({ message: "Wellcome to rpay admin" });
});

app.use(adminRoute);
app.use(transactions);
app.use(Users);

app.listen(PORT, () => {
  console.log("Listining on ", PORT);
});
