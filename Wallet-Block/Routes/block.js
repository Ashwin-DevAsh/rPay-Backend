const app = require("express").Router();
const postgres = require("../Database/Connections/pgConnections");
const jwt = require("jsonwebtoken");
const hash = require("object-hash");

app.post("/addTransactionBlock", (req, res) => {
  console.log("Adding transaction block....");
  addBlock(res, req.body.transactionID, req.body, "Transaction");
  console.log(req.body);
});

app.post("/addMoneyBlock", (req, res) => {
  console.log("Adding money block....");
  addBlock(res, req.body.transactionID, req.body, "Amount Generated");
  console.log(req.body);
});

app.post("/addUserBlock", (req, res) => {
  console.log("Adding user block....");
  addBlock(res, req.body.id, req.body, "New User");
  console.log(req.body);
});

const addBlock = async (res, refID, data, type) => {
  try {
    var prevBlock = (
      await postgres.query(
        `select * from blocks order by timestamp desc limit 1`
      )
    ).rows;
    var prevHash = "None";
    if (prevBlock.length != 0) {
      prevHash = hash(prevBlock[0]);
    }

    console.log(prevHash, prevBlock);

    const dataHash = jwt.sign({ data, prevHash }, process.env.PRIVATE_KEY);
    await postgres.query(
      `insert into blocks(refID,type,encryptedData,verifiedBy) values($1,$2,$3,$4)`,
      [refID, type, dataHash, ["server"]]
    );

    res.send({ message: "done" });
  } catch (err) {
    console.log(err);
    res.send({ message: "failed" });
  }
};

module.exports = app;