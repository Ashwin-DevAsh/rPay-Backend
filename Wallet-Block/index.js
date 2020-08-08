const express = require("express");
const redisClient = require("./Database/Connections/redisConnection");

const app = express();

redisClient.set("demo", "1", (err, replay) => {
  console.log(err, replay);
  redisClient.get("demo", (err, replay) => {
    console.log(err, replay);
  });
});

app.get("/", (req, res) => {
  res.send({ message: "wellcome to rec-wallet block" });
});

app.listen(9000, () => {
  console.log("listing on 9000....");
});
