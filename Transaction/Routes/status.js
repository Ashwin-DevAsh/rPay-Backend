var app = require("express").Router();
const clientDetails = require("../Database/ClientDetails");
const { Pool } = require("pg");
var jwt = require("jsonwebtoken");

var pool = new Pool(clientDetails);

app.get("/getTransactionsBetweenObjects", async (req, res) => {
  console.log("get transactions between objects..");

  var postgres = await pool.connect();
  await getTransactionsBetweenObjects(postgres, req, res);
  (await postgres).release();
});

async function getTransactionsBetweenObjects(postgres, req, res) {
  var fromID = req.query.id1;
  var toID = req.query.id2;
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
        `select
								 TransactionId,
								 TransactionTime,
								 fromMetadata,
								 toMetadata,
								 amount,
								 isGenerated,
                                 isWithdraw,
                                 message,
								 to_timestamp(transactionTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
						   from 
							   transactions 
						   where 
								(cast(fromMetadata->>'id' as varchar) = $1 or cast(fromMetadata->>'id' as varchar) = $2) 
								     and 
								(cast(toMetadata->>'id' as varchar) = $1 or cast(toMetadata->>'id' as varchar) = $2)
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

module.exports = app;
