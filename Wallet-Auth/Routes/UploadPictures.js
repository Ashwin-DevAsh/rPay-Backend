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
      console.log(file);
      var extension = file.originalname.split(".")[
        file.originalname.split(".").length - 1
      ];
      console.log(extension);
      cb(null, req.params.id + "." + extension);
    },
  }),
}).array("profilePicture", 1);

app.post("/addProfilePicture/:id", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.send({ message: "error", err });
    } else if (!req.file) {
      res.send({ message: "error", err: "Invalid file" });
    } else {
      res.send({ message: "done" });
    }
  });
});

module.exports = app;
