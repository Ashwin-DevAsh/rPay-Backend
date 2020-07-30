const app = require("express").Router();
const Otp = require("../Schemas/RecoveryOtp");
var api = require("../node_modules/clicksend/api.js");

app.get("/getRecoveryOtp", (req, res) => sendOtp(req, res, Otp));
var sendOtp = (req, res, OtpObject) => {
  console.log("getting recovery otp");
  var emailID = req.query["emailID"];
  var otpNumber = Math.floor(1000 + Math.random() * 9000);
  if (emailID) {
    OtpObject.deleteMany({ emailID: emailID })
      .exec()
      .then(() => {
        var emailTransactionalApi = new api.TransactionalEmailApi(
          "ashwin.r.2018.cse@rajalakshmi.edu.in",
          "49EB7110-46BA-6A73-9DDE-15C7B2F9C9F0"
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
            // const otpObject = new OtpObject({
            //   number,
            //   otp: otpNumber,
            //   verified: false,
            // });
            // otpObject.save();
            res.json([{ message: "done" }]);
          })
          .catch(function (err) {
            console.log(err);
            res.json([{ message: "failed", err, text: "Unable to send sms" }]);
          });
      })
      .catch((e) => {
        res.json([{ message: "failed", err: e, text: "delete otp err" }]);
      });
  } else {
    res.json([{ message: "failed" }]);
  }
};

module.exports = app;
