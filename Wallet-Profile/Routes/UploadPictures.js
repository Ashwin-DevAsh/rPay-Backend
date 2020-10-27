const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const app = require("express").Router();

aws.config.update({
  secretAccessKey: process.env.AWS_SEC_KEY,
  accessKeyId: process.env.AWS_ID,
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
      cb(null, imageName);
    },
  }),
}).single("profilePicture");

app.post("/addProfilePicture/:id", async(req, res) => {

  await addProfilePicture(req,res)


});

var addProfilePicture =  async (req,res)=>{


  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "error" });
     return
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
        }
      });
}


module.exports = app;
