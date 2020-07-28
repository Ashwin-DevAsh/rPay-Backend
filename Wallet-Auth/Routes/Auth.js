const app = require("express").Router();
const Otp = require("../Schemas/otp");
const https = require("https");
const User = require("../Schemas/users");
const jwt = require("jsonwebtoken");
const api_key_otp = "6bcb8fa0-ca41-11ea-9fa5-0200cd936042";
var api = require("../node_modules/clicksend/api.js");
var smsMessage = new api.SmsMessage();
//change database

app.get("/getOtp", (req, res) => sendOtp(req, res, "uPxbwGuwMaB"));

app.get("/getOtpMerchant", (req, res) => sendOtp(req, res, "RGhR1jQhc7+"));

app.post("/setOtp", (req, res) => {
  var otpNumber = req.body["otpNumber"];
  var number = req.body["number"];
  if (otpNumber && number) {
    Otp.findOne({ number })
      .exec()
      .then((result) => {
        console.log(result);
        if (result.otp == otpNumber) {
          Otp.findOneAndUpdate({ number }, { verified: true }, (err, doc) => {
            if (err) {
              res.json([{ message: "error" }]);
            } else {
              User.findOne({ number })
                .exec()
                .then((doc) => {
                  if (doc) {
                    jwt.sign(
                      {
                        name: doc.name,
                        number: doc.number,
                        email: doc.email,
                      },
                      process.env.PRIVATE_KEY,
                      (err, token) => {
                        if (err) {
                          res.json([{ message: err }]);
                        } else {
                          res.json([{ message: "verified", user: doc, token }]);
                          Otp.deleteMany({ number }).exec();
                        }
                      }
                    );
                  } else {
                    res.json([{ message: "verified", user: null }]);
                  }
                })
                .catch((err) => {
                  res.json([{ message: "err" }]);
                });
            }
          });
        } else {
          res.json([{ message: "not matching" }]);
        }
      })
      .catch((err) => {
        res.json([{ message: "error" }]);
      });
  } else {
    res.json([{ message: "elements not found" }]);
  }
});

app.delete("/deleteOtp", (req, res) => {
  var number = req.query["number"];
  if (number) {
    Otp.deleteMany({ number })
      .exec()
      .then((result) => {
        res.json([{ message: "done" }]);
      })
      .catch((err) => {
        res.json([{ message: "error" }]);
      });
  } else {
    res.json([{ message: "missing parameter" }]);
  }
});

var sendOtp = (req, res, appId) => {
  var number = req.query["number"];
  var otpNumber = Math.floor(1000 + Math.random() * 9000);
  if (number) {
    Otp.deleteMany({ number })
      .exec()
      .then(() => {
        smsMessage.from = "Rpay";
        smsMessage.to = `+${number}`;
        smsMessage.body = `<#> Rpay never calls you asking for otp. Sharing it with anyone gives them full access to your Rpay wallet. Your Login OTP is ${otpNumber} . ID: ${appId}`;

        var smsApi = new api.SMSApi(
          "ashwin.r.2018.cse@rajalakshmi.edu.in",
          "49EB7110-46BA-6A73-9DDE-15C7B2F9C9F0"
        );

        var smsCollection = new api.SmsMessageCollection();

        smsCollection.messages = [smsMessage];

        smsApi
          .smsSendPost(smsCollection)
          .then(function (response) {
            console.log(response.body);
            const otpObject = new Otp({
              number,
              otp: otpNumber,
              verified: false,
            });
            otpObject.save();
            res.json([{ message: "done" }]);
          })
          .catch(function (err) {
            console.error(err.body);
            res.json([{ message: "failed" }]);
          });
      })
      .catch((err) => {
        res.json([{ message: "failed" }]);
      });
  } else {
    res.json([{ message: "failed" }]);
  }
};

module.exports = app;
