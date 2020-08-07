require("dotenv").config(".env");
const express = require("express");
const Admin = require("./Database/Schema/Admin");
const Users = require("./Routes/Users");
const Stats = require("./Routes/Stats");
const Merchants = require("./Routes/Merchants");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const transactions = require("./Routes/Transactions");
const nodesAndBlocks = require("./Routes/nodesAndBlocks");

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
          name: "Root",
          number: "919551574355",
          email: "rootAdmin@rpay.com",
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
app.use(Merchants);
app.use(Users);
app.use(Stats);
app.use(nodesAndBlocks);

app.listen(PORT, () => {
  console.log("Listining on ", PORT);
});
