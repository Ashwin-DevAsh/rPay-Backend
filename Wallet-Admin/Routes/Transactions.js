const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");

app.get("/getTransactions", (req, res) => {
  //   var count = req.params.count;
  //   console.log(count);
  console.log("getting Transaction");

  var token = req.get("token");

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      if (decoded.name) {
        postgres
          .query("select *,row_number() over() as index from transactions")
          .then((datas) => {
            console.log(datas.rows[0]);
            res.send(datas);
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
