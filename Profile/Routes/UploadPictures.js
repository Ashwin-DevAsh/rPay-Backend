const multer = require("multer");
const jwt = require("jsonwebtoken");
const app = require("express").Router();
const FCM = require("fcm-node");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../profilePictures/");
  },
  filename: function (req, file, cb) {
    var id = req.params.id;
    cb(null, `${id}.jpg`);
  },
});

var upload = multer({
  storage: storage,
}).single("profilePicture");

app.post("/addProfilePicture/:id", async (req, res) => {
  await addProfilePicture(req, res);
});

app.get("/getProfilePicture/:imageName", async (req, res) => {
  var imageName = req.params.imageName;
  console.log(imageName);
  res.download("../profilePictures/" + imageName);
});

var addProfilePicture = async (req, res) => {
  try {
    var id = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY).id;
  } catch (e) {
    console.log(e);
    res.send({ message: "error" });
    return;
  }

  upload(req, res, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ message: "error", err });
    } else if (!req.file) {
      res.send({ message: "error", err: "Invalid file" });
    } else {
      res.send({
        message: "done",
        result: result,
        path: "path = " + this.path,
      });
      sendNotificationToAll(req.params.id);
    }
  });
};

function sendNotificationToAll(id) {
  var serverKey = process.env.FCM_KEY;
  var fcm = new FCM(serverKey);
  console.log(serverKey);
  var message = {
    to: "/topics/all",
    data: {
      type: `updateProfilePicture,${id}`,
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
