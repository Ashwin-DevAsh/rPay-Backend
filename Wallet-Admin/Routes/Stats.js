const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");
const Users = require("../Database/Schema/Users");

app.get("/getTransactionStats/:days", (req, res) => {
  doProcess(req, res, transactionStatsQuery);
});

app.get("/getNoTransactionStats/:days", (req, res) => {
  doProcess(req, res, noTransactionStatsQuery);
});

app.get("/getGeneratedStats/:days", (req, res) => {
  doProcess(req, res, generatedStatsQuery);
});

function doProcess(req, res, queryFunction) {
  var token = req.get("token");

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

  jwt.verify(token, process.env.PRIVATE_KEY, async function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      try {
        var day = await postgres.query(queryFunction(days), ["day"]);
        var week = await postgres.query(queryFunction(days), ["week"]);
        var month = await postgres.query(queryFunction(days), ["month"]);
        res.send({
          day,
          week,
          month,
        });
      } catch (e) {
        console.error(e.stack);
        res.send(e);
      }
    }
  });
}

function transactionStatsQuery(day) {
  return `select 
                 min(to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')) as fromDate ,
                 max(to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')) as toDate ,
                 date_part($1 , to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')::date) as n,
                 sum(amount) as total
            from
                 transactions 
            where 
                  to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

function noTransactionStatsQuery(day) {
  return `select 
                 min(to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')) as fromDate ,
                 max(to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')) as toDate ,
                 date_part($1 , to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')::date) as n,
                 count(amount) as total
            from
                 transactions 
            where 
                  to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

function generatedStatsQuery(day) {
  return `select 
                 min(to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')) as fromDate ,
                 max(to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')) as toDate ,
                 date_part($1 , to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss')::date) as n,
                 sum(amount) as total
            from
                 transactions 
            where 
                 isgenerated=true and to_timestamp(transactiontime, 'MM-DD-YYYY hh:mi:ss') >= current_date - ${day}
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
