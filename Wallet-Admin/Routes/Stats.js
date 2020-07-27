const app = require("express").Router();
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");
const Users = require("../Database/Schema/Users");

app.get("/getTransactionStats/:days", (req, res) => {
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

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      postgres
        .query(transactionStatsQuery(days), ["day"])
        .then((day) => {
          postgres
            .query(transactionStatsQuery(days), ["week"])
            .then((week) => {
              postgres
                .query(transactionStatsQuery(days), ["month"])
                .then((month) => {
                  console.log(month.rows[0]);
                  res.send({
                    day,
                    week,
                    month,
                  });
                })
                .catch((e) => {
                  console.error(e.stack);
                  res.send(e);
                });
            })
            .catch((e) => {
              console.error(e.stack);
              res.send(e);
            });
        })
        .catch((e) => {
          console.error(e.stack);
          res.send(e);
        });
    }
  });
});

app.get("/getNoTransactionStats/:days", (req, res) => {
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

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      postgres
        .query(noTransactionStatsQuery(days), ["day"])
        .then((day) => {
          postgres
            .query(noTransactionStatsQuery(days), ["week"])
            .then((week) => {
              postgres
                .query(noTransactionStatsQuery(days), ["month"])
                .then((month) => {
                  console.log(month.rows[0]);
                  res.send({
                    day,
                    week,
                    month,
                  });
                })
                .catch((e) => {
                  console.error(e.stack);
                  res.send(e);
                });
            })
            .catch((e) => {
              console.error(e.stack);
              res.send(e);
            });
        })
        .catch((e) => {
          console.error(e.stack);
          res.send(e);
        });
    }
  });
});

app.get("/getGeneratedStats/:days", (req, res) => {
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

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      postgres
        .query(generatedStatsQuery(days), ["day"])
        .then((day) => {
          postgres
            .query(generatedStatsQuery(days), ["week"])
            .then((week) => {
              postgres
                .query(generatedStatsQuery(days), ["month"])
                .then((month) => {
                  console.log(month.rows[0]);
                  res.send({
                    day,
                    week,
                    month,
                  });
                })
                .catch((e) => {
                  console.error(e.stack);
                  res.send(e);
                });
            })
            .catch((e) => {
              console.error(e.stack);
              res.send(e);
            });
        })
        .catch((e) => {
          console.error(e.stack);
          res.send(e);
        });
    }
  });
});

function transactionStatsQuery(day) {
  return `select 
                 min(to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')) as fromDate ,
                 max(to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')) as toDate ,
                 date_part($1 , to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')::date) as n,
                 sum(amount) as total
            from
                 transactions 
            where 
                  to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

function noTransactionStatsQuery(day) {
  return `select 
                 min(to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')) as fromDate ,
                 max(to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')) as toDate ,
                 date_part($1 , to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')::date) as n,
                 count(amount) as total
            from
                 transactions 
            where 
                  to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY') >= current_date - ${day}
            group by 
                  n
            order by
                  n;`;
}

function generatedStatsQuery(day) {
  return `select 
                 min(to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')) as fromDate ,
                 max(to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')) as toDate ,
                 date_part($1 , to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY')::date) as n,
                 sum(amount) as total
            from
                 transactions 
            where 
                 isgenerated=true and to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY') >= current_date - ${day}
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

// select min(date), date_part('month', date:: date) as time, sum(amount) from(select to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY') as date, sum(amount) as amount from transactions where to_date(Split_part(transactiont
// ime, ' ', 1), 'MM-DD-YYYY') >= current_date - 10 group by date order by date) as temp group by time;
