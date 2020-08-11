const app = require("express").Router();
const FCM = require("fcm-node");
const jwt = require("jsonwebtoken");

app.get("/getMerchants", (req, res) => {
  console.log("getting merchants");
  var token = req.get("token");
  console.log("Getting Users");

  jwt.verify(token, process.env.PRIVATE_KEY, async function (err, decoded) {
    if (err) {
      res.send({ message: "error", err });
    } else {
      try {
        var users = (await postgres.query("select * from merchants")).rows;
        res.send(users);
      } catch (err) {
        res.send({ err });
      }
    }
  });
});

app.post("/updateMerchantStatus", (req, res) => {
  // var id = req.body.id;
  // var status = req.body.status;
  // console.log(id, status);
  // if (!id || !status) {
  //   res.send({ message: "error" });
  //   return;
  // }
  // Users.findOneAndUpdate({ id }, { status })
  //   .exec()
  //   .then((doc) => {
  //     sendNotificationToAll(id, status);
  //     res.send({ message: "done" });
  //   })
  //   .catch((e) => {
  //     res.send({ message: "error", e });
  //   });
});

function sendNotificationToAll(id, isActive) {
  console.log("sending notification to all merchant");
  // var serverKey = process.env.FCM_KEY; //put your server key here
  var serverKey =
    "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A";
  var fcm = new FCM(serverKey);
  console.log(serverKey);
  var message = {
    condition: "!('anytopicyoudontwanttouse' in topics)",
    data: {
      type: `merchantStatus,${id},${isActive}`,
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
