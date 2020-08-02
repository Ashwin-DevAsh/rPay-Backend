const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const app = require("express").Router();

aws.config.update({
  secretAccessKey: process.env.AWSSecretKey,
  accessKeyId: process.env.AWSAccessKeyId,
  region: "us-east-2",
});

var upload = multer({
  storage: multerS3({
    s3: new aws.S3(),

    bucket: "rec-wallet-profile-pictures",

    key: function (req, file, cb) {
      var extension = file.originalname.split(".")[
        file.originalname.split(".").length - 1
      ];
      cb(null, req.params.id + "." + extension);
    },
  }),
}).single("profilePicture");

app.post("/addProfilePicture/:id", (req, res) => {
  upload(req, res, (err, result) => {
    if (err) {
      res.send({ message: "error", err });
    } else if (!req.file) {
      res.send({ message: "error", err: "Invalid file" });
    } else {
      res.send({ message: "done", result: result, path: this.path });
    }
  });
});

module.exports = app;
