const app = require("express").Router();
const Otp = require("../Schemas/RecoveryOtp");
var api = require("../node_modules/clicksend/api.js");
const jwt = require("jsonwebtoken");
const Users = require("../Schemas/users");

app.get("/getRecoveryOtp", (req, res) => sendOtp(req, res, Otp));

app.post("/setRecoveryOtp", (req, res) => setOtp(req, res, Otp));

app.post("/newPassword", (req, res) => {
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, function (
    err,
    decoded
  ) {
    if (err) {
      console.log(err);
      res.status(200).send({ message: "error" });
      return;
    } else {
      console.log("Changing password...");
      var data = req.body;
      console.log(data);
      if (!data.id || !data.newPassword || !data.emailID) {
        res.status(200).send({ message: "error", err: "Invalid credientials" });
        return;
      }

      Otp.findOne({ emailID: data.emaiID })
        .exec()
        .then((otpDoc) => {
          console.log(otpDoc);
          if (otpDoc && otpDoc.verified) {
            Otp.deleteMany({
              emaiID: data.emaiID,
            }).exec();
            Users.findOneAndUpdate(
              { id: data.id },
              { password: data.newPassword },
              (err, doc) => {
                console.log(doc);
                if (err) {
                  console.log(err);
                  res.status(200).send({ message: "error" });
                  return;
                } else {
                  res.status(200).send({ message: "done" });
                  return;
                }
              }
            );
          } else {
            res.status(200).send({ message: "otp not verified" });
          }
        });
    }
  });
});

var sendOtp = (req, res, OtpObject) => {
  console.log("getting recovery otp");
  var emailID = req.query["emailID"];
  var otpNumber = Math.floor(1000 + Math.random() * 9000);

  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, function (
    err,
    decoded
  ) {
    if (err) {
      console.log("jwt error = ", err);
      res.status(200).send({ message: "error" });
      return;
    } else {
      console.log("Recovery password...");
      if (emailID) {
        OtpObject.deleteMany({ emailID: emailID })
          .exec()
          .then(() => {
            var emailTransactionalApi = new api.TransactionalEmailApi(
              process.env.OTP_USERNAME,
              process.env.OTP_API_KEY
            );

            var emailRecipient = new api.EmailRecipient();
            emailRecipient.email = emailID;
            emailRecipient.name = "Rpay";

            var emailFrom = new api.EmailFrom();
            emailFrom.emailAddressId = 11297;
            emailFrom.name = "Rpay";

            var email = new api.Email();

            email.to = [emailRecipient];
            email.from = emailFrom;
            email.subject = `Password Recovery`;
            email.body = `Rpay never calls you asking for otp. Sharing it with anyone gives them full access to your Rpay wallet. Your Recovery OTP is ${otpNumber}`;

            emailTransactionalApi
              .emailSendPost(email)
              .then(function (response) {
                console.log(response.body);
                const otpObject = new OtpObject({
                  emailID,
                  otp: otpNumber,
                  verified: false,
                });
                otpObject.save();
                res.json([{ message: "done" }]);
              })
              .catch(function (err) {
                console.log("sms error = ", err);
                res.json([
                  { message: "failed", err, text: "Unable to send sms" },
                ]);
              });
          })
          .catch((e) => {
            res.json([{ message: "failed", err: e, text: "delete otp err" }]);
          });
      } else {
        res.json([{ message: "failed" }]);
      }
    }
  });
};

var setOtp = (req, res, OtpObject) => {
  var otpNumber = req.body["otpNumber"];
  var emailID = req.body["emailID"];
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, function (
    err,
    decoded
  ) {
    if (err) {
      console.log("jwt error = ", err);
      res.status(200).send({ message: "error" });
      return;
    } else {
      if (otpNumber && emailID) {
        OtpObject.findOne({ emailID })
          .exec()
          .then((result) => {
            console.log(result);
            if (result.otp == otpNumber) {
              OtpObject.findOneAndUpdate(
                { emailID },
                { verified: true },
                (err, doc) => {
                  console.log(doc);
                  if (err) {
                    res.json([{ message: "error" }]);
                  } else {
                    console.log("Verified....");
                    res.json([{ message: "done" }]);
                  }
                }
              );
            } else {
              console.log("Not matching....");
              res.json([{ message: "not matching" }]);
            }
          })
          .catch((err) => {
            res.json([{ message: "error" }]);
          });
      } else {
        res.json([{ message: "elements not found" }]);
      }
    }
  });
};

module.exports = app;
