const app = require("express").Router();
const FCM = require("fcm-node");
const jwt = require("jsonwebtoken");
const postgres = require("../Database/Connections/pgConnections");

app.get("/getMerchants", (req, res) => {
  console.log("getting merchants");
  var token = req.get("token");

  jwt.verify(token, process.env.PRIVATE_KEY, async function (err, decoded) {
    if (err) {
      console.log(err);
      res.send({ message: "error", err });
    } else {
      try {
        var users = (await postgres.query("select * from merchants")).rows;
        res.send(users);
      } catch (err) {
        console.log(err);
        res.send({ err });
      }
    }
  });
});

app.post("/updateMerchantStatus", (req, res) => {
  var token = req.get("token");
  jwt.verify(token, process.env.PRIVATE_KEY, async function (err, decoded) {
    if (err) {  
      console.log(err);
      res.send({ message: "error", err });
    } else {
      var id = req.body.id;
      var status = req.body.status;
      console.log(id, status);
      if (!id || !status) {
        res.send({ message: "error" });
        return;
      }

      try {
        await postgres.query("update merchants set status = $2 where id=$1", [
          id,
          status,
        ]);
        sendNotificationToAll(id, status);
        res.send({ message: "done" });
      } catch (e) {
        res.send({ message: "error", e });
      }
    }
  });
});

function sendNotificationToAll(id, isActive) {
  console.log("sending notification to all merchant");
  var serverKey = process.env.FCM_KEY;
  var fcm = new FCM(serverKey);
  console.log(serverKey);
  var message = {
    condition: "!('anytopicyoudontwanttouse' in topics)",
    data: {
      type: `merchantStatus`,

      // type: `merchantStatus,${id},${isActive}`,
    },
  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

module.exports = app;
