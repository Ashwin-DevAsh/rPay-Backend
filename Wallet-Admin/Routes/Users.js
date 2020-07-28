const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");
const Users = require("../Database/Schema/Users");

app.get("/getUsers", (req, res) => {
  var token = req.get("token");
  console.log("Getting Users");

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      Users.find({})
        .exec()
        .then((doc) => {
          res.send(doc);
        })
        .catch((e) => {
          res.send({ err: e });
        });
    }
  });
});

app.get("/getMyTransactions/:id", (req, res) => {
  var token = req.get("token");
  console.log("Getting Users");

  var id = req.params.id;
  if (!req.params.id) {
    res.send({ message: "err" });
  }

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      if (decoded.name) {
        postgres
          .query(`select * from transactions where fromid=$1 or toid=$1`, [id])
          .then((datas) => {
            postgres
              .query(`select balance from amount where id=$1`, [id])
              .then((myBalance) => {
                console.log(datas.rows[0]);
                res.send({ ...datas, balance: myBalance.rows[0].balance });
              })
              .catch((e) => {
                console.error(e.stack);
                res.send(e);
              });
          })
          .catch((e) => {
            console.error(e.stack);
            res.send(e);
          });
      }
    }
  });
});

module.exports = app;
