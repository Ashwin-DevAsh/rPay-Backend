const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");

app.get("/getTransactions/:count", (req, res) => {
  var count = req.params.count;

  postgres
    .query("select * from transactions")
    .then((datas) => {
      console.log(datas.rows[0]);
      res.send(datas);
    })
    .catch((e) => console.error(e.stack));
});
