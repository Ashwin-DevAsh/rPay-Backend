const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const app = require("express").Router();
const merchant = require("../Schemas/Merchants");
const users = require("../Schemas/users");

aws.config.update({
  secretAccessKey: "Il8ggtmP1hyNxaO7hGtHZ3A63cCaftqGLs3AK2Ke",
  accessKeyId: "AKIAXOQRXVIA2QSAREGZ",
  region: "us-east-2",
});

var upload = multer({
  storage: multerS3({
    s3: new aws.S3(),
    acl: "public-read",
    bucket: "rec-wallet-profile-pictures",
    key: function (req, file, cb) {
      var extension = file.originalname.split(".")[
        file.originalname.split(".").length - 1
      ];
      var id = req.params.id;
      var imageName = id + "." + extension;
      updateDatabase(id, imageName);
      cb(null, imageName);
    },
  }),
}).single("profilePicture");

app.post("/addProfilePicture/:id", (req, res) => {
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, function (
    err,
    decoded
  ) {
    if (err) {
      console.log("jwt error = ", err);
      res.status(200).send({ message: "error", err });
      return;
    } else {
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
        }
      });
    }
  });
});

function updateDatabase(id, imageName) {
  imageURL =
    "https://rec-wallet-profile-pictures.s3.us-east-2.amazonaws.com/" +
    imageName;
  if (id.includes("rpay")) {
    users.findOneAndUpdate({ id }, { imageURL }, (err, doc) => {
      if (err) {
        console.log("failed");
      } else {
        console.log(doc);
      }
    });
  } else {
    merchant.findOneAndUpdate({ id }, { imageURL }, (err, doc) => {
      if (err) {
        console.log("failed");
      } else {
        console.log(doc);
      }
    });
  }
}

module.exports = app;
