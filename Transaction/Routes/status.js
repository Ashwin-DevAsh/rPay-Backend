var app = require("express").Router();
const clientDetails = require("../Database/ClientDetails");
const { Pool } = require("pg");

var pool = new Pool(clientDetails);

app.post("/getTransactionsBetweenObjects", async (req, res) => {
  var postgres = await pool.connect();
  await getTransactionsBetweenObjects(postgres, req, res);
  (await postgres).release();
});

app.post("/getTransactions", async (req, res) => {
  var postgres = await pool.connect();
  await getTransactions(postgres, req, res);
  (await postgres).release();
});

async function getTransactionsBetweenObjects(postgres, req, res) {}

async function getTransactions(postgres, req, res) {
  try {
    var id = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY).id;
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }
  try {
    var transactions = (
      await postgres.query(
        `select TransactionId,
								 TransactionTime,
								 fromMetadata,
								 toMetadata,
								 amount,
								 isGenerated,
								 isWithdraw,
								 to_timestamp(transactionTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
						   from 
							   transactions 
						   where 
							   cast(fromMetadata->>'id' as varchar) = $1 or cast(toMetadata->>'id' as varchar) = $1`,
        [id]
      )
    ).rows;
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
  }
}

module.exports = app;
