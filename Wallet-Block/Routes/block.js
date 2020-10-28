const app = require("express").Router();
const jwt = require("jsonwebtoken");
const hash = require("object-hash");
const {Pool} = require("pg");
const clientDetails = require("../Database/ClientDetails")

var pool = new Pool(clientDetails)


app.post("/addTransactionBlock", async(req, res) => {
  var postgres = pool.connect()

  await addBlock(postgres,res, req.body.transactionID, req.body, "Transaction");
  (await postgres).release()
});

app.post("/addMoneyBlock", async(req, res) => {
  var postgres = pool.connect()

  await addBlock(postgres,res, req.body.transactionID, req.body, "Amount Generated");
  (await postgres).release()

});

app.post("/addWithdrawBlock", async (req, res) => {
  var postgres = pool.connect()

  await addBlock(postgres,res, req.body.transactionID, req.body, "Withdraw");
  (await postgres).release()

});

app.post("/addUserBlock", async (req, res) => {
  var postgres = pool.connect()

  await addBlock(postgres,res, req.body.id, req.body, "New User");
  (await postgres).release()

});

const addBlock = async (postgres,res, refID, data, type) => {
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
