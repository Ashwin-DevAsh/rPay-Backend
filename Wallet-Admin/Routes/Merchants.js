const app = require("express").Router();
const Users = require("../Database/Schema/Merchant");
const FCM = require("fcm-node");
const { update } = require("../Database/Schema/Merchant");

app.get("/getMerchants", (req, res) => {
  console.log("getting merchants");
  Users.find({}, [
    "name",
    "number",
    "email",
    "id",
    "qrCode",
    "imageURL",
    "accountInfo",
    "storeName",
    "status",
  ])
    .exec()
    .then((doc) => {
      console.log(doc);
      res.status(200).send(doc);
    })
    .catch((e) => {
      console.log(e);
      res.send(e);
    });
});

app.post("/updateMerchantStatus", (req, res) => {
  var id = req.body.id;
  var status = req.body.status;
  console.log(id, status);
  if (!id || !status) {
    res.send({ message: "error" });
    return;
  }
  Users.findOneAndUpdate({ id }, { status })
    .exec()
    .then((doc) => {
      sendNotificationToAll(id, status);
      res.send({ message: "done" });
    })
    .catch((e) => {
      res.send({ message: "error", e });
    });
});

function sendNotificationToAll(id, isActive) {
  console.log("sending notification to all");
  var serverKey = process.env.FCM_KEY; //put your server key here
  var fcm = new FCM(serverKey);
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
