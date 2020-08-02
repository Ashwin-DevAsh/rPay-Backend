const aws = require('aws-sdk'),
const multerS3 = require('multer-s3');
const multer = require("multer");
const path = require("path");


aws.config.update({
    secretAccessKey: process.env.AWSSecretKey,
    accessKeyId: process.env.AWSAccessKeyId,
    region: 'us-east-2'
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'rec-wallet-profile-pictures',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname);
        }
    })
});

app.post("/addProfilePicture", (req, res) => {
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

module.exports=app