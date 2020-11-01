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

async function getTransactionsBetweenObjects(postgres, req, res) {
  var fromID = req.body.fromID;
  var toID = req.body.toID;
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
        `((select
								 TransactionId as id,
								 TransactionTime as time,
								 fromMetadata,
								 toMetadata,
								 null as message,
								 amount as amount,
								 isGenerated,
                                 isWithdraw,
                                 message,
								 to_timestamp(transactionTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
						   from 
							   transactions 
						   where 
								(cast(fromMetadata->>'id' as varchar) = $1 or cast(fromMetadata->>'id' as varchar) = $2) 
								     and 
								(cast(toMetadata->>'id' as varchar) = $1 or cast(toMetadata->>'id' as varchar) = $2))
						   order by TimeStamp`,
        [fromID, toID]
      )
    ).rows;
    res.send({ message: "done", transactions });
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
  }
}

async function getTransactions(postgres, req, res) {}

module.exports = app;
