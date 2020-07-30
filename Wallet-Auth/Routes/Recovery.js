const app = require("express").Router();
const Otp = require("../Schemas/RecoveryOtp");
const MerchantOtp = require("../Schemas/MerchantsOtp");
const https = require("https");
const User = require("../Schemas/users");
const Merchant = require("../Schemas/Merchants");
const jwt = require("jsonwebtoken");
const api_key_otp = "6bcb8fa0-ca41-11ea-9fa5-0200cd936042";
var api = require("../node_modules/clicksend/api.js");
var smsMessage = new api.SmsMessage();

app.get("/getRecoveryOtp", (req, res) => sendOtp(req, res, Otp));
var sendOtp = (req, res, OtpObject) => {
  console.log("getting recovery otp");
  var emailID = req.query["emailID"];
  var otpNumber = Math.floor(1000 + Math.random() * 9000);
  if (emailID) {
    OtpObject.deleteMany({ emailID: emailID })
      .exec()
      .then(() => {
        smsMessage.from = "Rpay";
        smsMessage.to = `+${emailID}`;
        smsMessage.body = `<#> Rpay never calls you asking for otp. Sharing it with anyone gives them full access to your Rpay wallet. Your Login OTP is ${otpNumber} . ID: ${appId}`;

        var emailTransactionalApi = new api.TransactionalEmailApi(
          process.env.OTP_USERNAME,
          process.env.OTP_API_KEY
        );

        var emailRecipient = new api.EmailRecipient();
        emailRecipient.email = emailID;
        emailRecipient.name = "Rpay";

        var emailFrom = new api.EmailFrom();
        emailFrom.emailAddressId = 4197;
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
              number,
              otp: otpNumber,
              verified: false,
            });
            otpObject.save();
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
