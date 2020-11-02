const app = require("express").Router();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");

app.get("/getTransactionStats/:days", async (req, res) => {
  var postgres = new Pool(clientDetails);
  await postgres.connect();
  await doProcess(postgres, req, res, transactionStatsQuery);
  await postgres.end();
});

app.get("/getNoTransactionStats/:days", async (req, res) => {
  var postgres = new Pool(clientDetails);
  await postgres.connect();
  await doProcess(postgres, req, res, noTransactionStatsQuery);
  await postgres.end();
});

app.get("/getGeneratedStats/:days", async (req, res) => {
  var postgres = new Pool(clientDetails);
  await postgres.connect();
  await doProcess(postgres, req, res, generatedStatsQuery);
  await postgres.end();
});

app.get("/getWithdrawStats/:days", async (req, res) => {
  var postgres = new Pool(clientDetails);
  await postgres.connect();
  await doProcess(postgres, req, res, withdrawStatsQuery);
  await postgres.end();
});

async function doProcess(postgres, req, res, queryFunction) {
  if (!req.params.days) {
    res.send({ message: "error" });
    return;
  }
  var days = 7;
  try {
    days = Number.parseInt(req.params.days) || 7;
  } catch (e) {
    res.send({ message: "error", e });
    return;
  }

  console.log(days);

  try {
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
  } catch (e) {
    console.log(e);
    res.send({ message: "failed" });
    return;
  }

  try {
    var day = await postgres.query(queryFunction(days), ["day"]);
    var week = await postgres.query(queryFunction(days), ["week"]);
    var month = await postgres.query(queryFunction(days), ["month"]);
    if (days == 1) {
      var hour = await postgres.query(queryFunction(days), ["hour"]);
    } else {
      var hour = day;
    }

    console.log(hour.rows);
    res.send({
      day,
      week,
      month,
      hour,
    });
  } catch (e) {
    console.error(e.stack);
    res.send(e);
  }
}

function transactionStatsQuery(day) {
  return `select 
                 min(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as fromDate ,
                 max(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as toDate ,
                 date_part($1 , to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')::timestamp) as n,
                 sum(amount) as total
            from
                 transactions 
            where 
                  to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

function noTransactionStatsQuery(day) {
  return `select 
                 min(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as fromDate ,
                 max(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as toDate ,
                 date_part($1 , to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')::timestamp) as n,
                 count(amount) as total
            from
                 transactions 
            where 
                  to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

function generatedStatsQuery(day) {
  return `select 
                 min(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as fromDate ,
                 max(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as toDate ,
                 date_part($1 , to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')::timestamp) as n,
                 sum(amount) as total
            from
                 transactions 
            where 
                 isgenerated=true and to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

function withdrawStatsQuery(day) {
  return `select 
                 min(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as fromDate ,
                 max(to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')) as toDate ,
                 date_part($1 , to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS')::timestamp) as n,
                 sum(amount) as total
            from
                 transactions 
            where 
                 iswithdraw=true and to_timestamp(transactiontime, 'MM-DD-YYYY HH24:MI:SS') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

module.exports = app;

// query from conver timestring to dates
// select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') from transactions;
// select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions group by date
// select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions where isgenerated=true group by date

//select * from (select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions where to_date( Split_part(transactiontime,' ',1),'MM-DD-YYYY')>current_date-10 group by date order by date) as temp
//;

// select date_part('month',date::date),amount from (select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions where to_date( Split_part(transactiontime,' ',1),'MM-DD-YYYY')
//>= current_date - 10 group by date order by date) as temp
//;

// select min(date), date_part('month', date:: date) as time, sum(amount) from(select to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss') as date, sum(amount) as amount from transactions where to_date(Split_part(transactiont
// ime, ' ', 1), 'MM-DD-YYYY') >= current_date - 10 group by date order by date) as temp group by time;
