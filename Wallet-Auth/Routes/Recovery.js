const app = require("express").Router();
const Otp = require("../Schemas/RecoveryOtp");
const OtpMerchant = require("../Schemas/RecoveryOtpMerchant");
var api = require("../node_modules/clicksend/api.js");
const jwt = require("jsonwebtoken");
const Users = require("../Schemas/users");
const Merchants = require("../Schemas/Merchants");
const postgres = require("../Database/postgresql");

app.get("/getRecoveryOtp", (req, res) => sendOtp(req, res, "recoveryOtp"));

app.get("/getRecoveryOtpMerchant", (req, res) =>
  sendOtp(req, res, "recoveryMerchantsOtp")
);

app.post("/setRecoveryOtp", (req, res) => setOtp(req, res, Otp));
app.post("/setRecoveryOtpMerchant", (req, res) =>
  setOtp(req, res, OtpMerchant)
);

app.post("/newPassword", (req, res) => newPassword(req, res, Otp, Users));
app.post("/newPasswordMerchant", (req, res) =>
  newPassword(req, res, OtpMerchant, Merchants)
);

app.post("/changePassword", (req, res) => changePassword(req, res, "users"));
app.post("/changeMerchantPassword", (req, res) => {
  changePassword(req, res, "merchants");
});

var changePassword = (req, res, tableName) => {
  console.log(req.get("token"));
  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, async function (
    err,
    decoded
  ) {
    if (err) {
      console.log(err);
      res.status(200).send({ message: "error" });
      return;
    }

    console.log("Changing password...");
    var data = req.body;
    console.log(data);
    if (!data.id || !data.oldPassword || !data.newPassword) {
      res.status(200).send({ message: "error" });
      return;
    }

    try {
      var user = (
        await postgres.query(
          `select * from ${tableName} where id = $1 and password=$2`,
          [data.id, data.oldPassword]
        )
      ).rows;

      if (user.length == 0) {
        res.status(200).send({ message: "error" });
        return;
      }

      await postgres.query(
        `update ${tableName} set password = $2 where id = $1`,
        [data.id, data.newPassword]
      );

      res.status(200).send({ message: "done" });
    } catch (err) {
      console.log(err);
      res.status(200).send({ message: "error" });
    }
  });
};

var newPassword = (req, res, Otp, Users) => {
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

      Otp.findOne({ emailID: data.emailID })
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
};

var sendOtp = (req, res, otpTable) => {
  console.log("getting recovery otp");
  var emailID = req.query["emailID"];
  var otpNumber = Math.floor(1000 + Math.random() * 9000);

  jwt.verify(req.get("token"), process.env.PRIVATE_KEY, async function (
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
        var emailTransactionalApi = new api.TransactionalEmailApi(
          // process.env.OTP_USERNAME,
          // process.env.OTP_API_KEY
          "ajaykrishnan.s.2018.cse@rajalakshmi.edu.in",
          "2617172A-B44A-4C96-7BA9-D9746E9D3230"
        );

        var emailRecipient = new api.EmailRecipient();
        emailRecipient.email = emailID;
        emailRecipient.name = "r pay";

        var emailFrom = new api.EmailFrom();
        emailFrom.emailAddressId = 11466;
        emailFrom.name = "r pay";

        var email = new api.Email();

        email.to = [emailRecipient];
        email.from = emailFrom;
        email.subject = `Password Recovery`;
        email.body = `Rpay never calls you asking for otp. Sharing it with anyone gives them full access to your Rpay wallet. Your Recovery OTP is ${otpNumber}`;
        try {
          await postgres.query(`delete from ${otpTable} where email=$1`, [
            emailID,
          ]);
          await emailTransactionalApi.emailSendPost(email);
          await postgres.query(`insert into ${otpTable} values($1,$2,$3)`, [
            emailID,
            otpNumber,
            false,
          ]);
          res.json([{ message: "done" }]);
        } catch (err) {
          res.json([{ message: "failed", err }]);
          console.log(err);
        }
      } else {
        res.json([{ message: "failed" }]);
      }
    }
  });
};

var setOtp = (req, res, OtpObject) => {
  var otpNumber = req.body["otpNumber"];
  var emailID = req.body["emailID"];
  console.log(emailID);
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
                { emailID: emailID },
                { verified: true },
                (err, doc) => {
                  console.log(doc, err);
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

// OtpObject.deleteMany({ emailID: emailID })
//   .exec()
//   .then(() => {
//     var emailTransactionalApi = new api.TransactionalEmailApi(
//       // process.env.OTP_USERNAME,
//       // process.env.OTP_API_KEY
//       "ajaykrishnan.s.2018.cse@rajalakshmi.edu.in",
//       "2617172A-B44A-4C96-7BA9-D9746E9D3230"
//     );

//     var emailRecipient = new api.EmailRecipient();
//     emailRecipient.email = emailID;
//     emailRecipient.name = "r pay";

//     var emailFrom = new api.EmailFrom();
//     emailFrom.emailAddressId = 11466;
//     emailFrom.name = "r pay";

//     var email = new api.Email();

//     email.to = [emailRecipient];
//     email.from = emailFrom;
//     email.subject = `Password Recovery`;
//     email.body = `Rpay never calls you asking for otp. Sharing it with anyone gives them full access to your Rpay wallet. Your Recovery OTP is ${otpNumber}`;

//     emailTransactionalApi
//       .emailSendPost(email)
//       .then(function (response) {
//         console.log(response.body);
//         const otpObject = new OtpObject({
//           emailID,
//           otp: otpNumber,
//           verified: false,
//         });
//         otpObject.save();
//         res.json([{ message: "done" }]);
//       })
//       .catch(function (err) {
//         console.log("sms error = ", err);
//         res.json([
//           { message: "failed", err, text: "Unable to send sms" },
//         ]);
//       });
//   })
//   .catch((e) => {
//     res.json([{ message: "failed", err: e, text: "delete otp err" }]);
//   });
