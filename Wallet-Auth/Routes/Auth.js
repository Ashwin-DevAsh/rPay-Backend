const app = require("express").Router();
const Otp = require("../Schemas/otp");
const MerchantOtp = require("../Schemas/MerchantsOtp");
const https = require("https");
const User = require("../Schemas/users");
const Merchant = require("../Schemas/Merchants");
const jwt = require("jsonwebtoken");
const api_key_otp = "6bcb8fa0-ca41-11ea-9fa5-0200cd936042";
var api = require("../node_modules/clicksend/api.js");
var smsMessage = new api.SmsMessage();
//change database

app.get("/getOtp", (req, res) => sendOtp(req, res, Otp, "uPxbwGuwMaB"));

app.get("/getOtpMerchant", (req, res) =>
  sendOtp(req, res, MerchantOtp, "i8Ua2mzmif/")
);

app.post("/setOtp", (req, res) => {
  setOtp(req, res, Otp, User);
});

app.post("/setOtpMerchant", (req, res) => {
  setOtp(req, res, MerchantOtp, Merchant, "rbusiness@");
});

var setOtp = (req, res, OtpObject, object, id = "rpay@") => {
  var otpNumber = req.body["otpNumber"];
  var number = req.body["number"];
  if (otpNumber && number) {
    OtpObject.findOne({ number })
      .exec()
      .then((result) => {
        console.log(result);

        if (result.otp == otpNumber) {
          OtpObject.findOneAndUpdate(
            { number },
            { verified: true },
            (err, doc) => {
              console.log(doc);
              if (err) {
                res.json([{ message: "error" }]);
              } else {
                object
                  .findOne({ id: id + number })
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
                            res.json([
                              { message: "verified", user: doc, token },
                            ]);
                            OtpObject.deleteMany({ number }).exec();
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
            }
          );
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
};

var sendOtp = (req, res, OtpObject, appId) => {
  var number = req.query["number"];
  var otpNumber = Math.floor(1000 + Math.random() * 9000);
  if (number) {
    OtpObject.deleteMany({ number })
      .exec()
      .then(() => {
        smsMessage.from = "Rpay";
        smsMessage.to = `+${number}`;
        smsMessage.body = `<#> Rpay never calls you asking for otp. Sharing it with anyone gives them full access to your Rpay wallet. Your Login OTP is ${otpNumber} . ID: ${appId}`;

        var smsApi = new api.SMSApi(
          process.env.OTP_USERNAME,
          process.env.OTP_API_KEY
        );

        var smsCollection = new api.SmsMessageCollection();

        smsCollection.messages = [smsMessage];

        smsApi
          .smsSendPost(smsCollection)
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
