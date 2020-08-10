const app = require("express").Router();
const Otp = require("../Schemas/otp");
const MerchantOtp = require("../Schemas/MerchantsOtp");
const User = require("../Schemas/users");
const Merchant = require("../Schemas/Merchants");
const jwt = require("jsonwebtoken");
var api = require("../node_modules/clicksend/api.js");
const postgres = require("../Database/postgresql");
const { use } = require("./User");
var smsMessage = new api.SmsMessage();

app.get("/getOtp", (req, res) => sendOtp(req, res, "Otp", "uPxbwGuwMaB"));

app.get("/getOtpMerchant", (req, res) =>
  sendOtp(req, res, "MerchantsOtp", "i8Ua2mzmif/")
);

app.post("/setOtp", (req, res) => {
  setOtp(req, res, "Otp", "users");
});

app.post("/setOtpMerchant", (req, res) => {
  setOtp(req, res, "MerchantsOtp", "merchants", "rbusiness@");
});

var setOtp = async (req, res, otpTable, userTable, id = "rpay@") => {
  var otpNumber = req.body["otpNumber"];
  var number = req.body["number"];

  if (!otpNumber || !number) {
    res.json([{ message: "elements not found" }]);
    return;
  }

  try {
    var result = (
      await postgres.query(
        `select * from ${otpTable} where otp = $1 and number = $2`,
        [otpNumber, number]
      )
    ).rows;

    if (result.length == 0) {
      res.json([{ message: "not matching" }]);
      return;
    }

    await postgres.query(`update ${otpTable} set otp = $1 where number = $2`, [
      otpNumber,
      number,
    ]);

    postgres.query(`delete from ${otpTable} where number = $1`, [number]);

    var user = (
      await postgres.query(`select * from ${userTable} where id = $1 `, [
        id + number,
      ])
    ).rows;

    if (user.length == 0) {
      res.json([{ message: "verified", user: null }]);
      return;
    }

    var userToken = jwt.sign(
      {
        name: user[0].name,
        number: user[0].number,
        email: user[0].email,
      },
      process.env.PRIVATE_KEY
    );
    res.json([{ message: "verified", user: user[0], token: userToken }]);
  } catch (err) {
    res.json([{ message: "error" }]);
  }
};

var sendOtp = async (req, res, otpTable, appId) => {
  var number = req.query["number"];

  if (!number) {
    res.json([{ message: "failed" }]);
    return;
  }

  var otpNumber = Math.floor(1000 + Math.random() * 9000);

  smsMessage.from = "Rpay";
  smsMessage.to = `+${number}`;
  smsMessage.body = `<#> Rpay never calls you asking for otp. Sharing it with 
                     anyone gives them full access to your Rpay wallet. 
                     Your Login OTP is ${otpNumber} . ID: ${appId}`;

  console.log({
    number,
    otpNumber,
  });

  var smsApi = new api.SMSApi(
    process.env.OTP_USERNAME,
    process.env.OTP_API_KEY
  );

  var smsCollection = new api.SmsMessageCollection();

  smsCollection.messages = [smsMessage];

  try {
    await postgres.query(`delete from ${otpTable} where number = $1`, [number]);
    console.log(await smsApi.smsSendPost(smsCollection));
    await postgres.query(`insert into ${otpTable} values($1,$2,false)`, [
      number,
      otpNumber,
    ]);
    res.json([{ message: "done" }]);
  } catch (err) {
    console.log(err);
    res.json([{ message: "failed", err }]);
  }
};

module.exports = app;

// OtpObject.deleteMany({ number })
//   .exec()
//   .then(() => {
//     smsMessage.from = "Rpay";
//     smsMessage.to = `+${number}`;
//     smsMessage.body = `<#> Rpay never calls you asking for otp. Sharing it with anyone gives them full access to your Rpay wallet. Your Login OTP is ${otpNumber} . ID: ${appId}`;
//     var smsApi = new api.SMSApi(
//       process.env.OTP_USERNAME,
//       process.env.OTP_API_KEY
//     );

//     var smsCollection = new api.SmsMessageCollection();

//     smsCollection.messages = [smsMessage];

//     smsApi
//       .smsSendPost(smsCollection)
//       .then(function (response) {
//         console.log(response.body);
//         const otpObject = new OtpObject({
//           number,
//           otp: otpNumber,
//           verified: false,
//         });
//         otpObject.save();
//         res.json([{ message: "done" }]);
//       })
//       .catch(function (err) {
//         console.error(err.body);
//         res.json([{ message: "failed" }]);
//       });
//   })
//   .catch((err) => {
//     res.json([{ message: "failed" }]);
//   });

// if (otpNumber && number) {
//   OtpObject.findOne({ number })
//     .exec()
//     .then((result) => {
//       console.log(result);

//       if (result.otp == otpNumber) {
//         OtpObject.findOneAndUpdate(
//           { number },
//           { verified: true },
//           (err, doc) => {
//             console.log(doc);
//             if (err) {
//               res.json([{ message: "error" }]);
//             } else {
//               object
//                 .findOne({ id: id + number })
//                 .exec()
//                 .then((doc) => {
//                   console.log(doc);
//                   if (doc) {
//                     jwt.sign(
//                       {
//                         name: doc.name,
//                         number: doc.number,
//                         email: doc.email,
//                       },
//                       process.env.PRIVATE_KEY,
//                       (err, token) => {
//                         if (err) {
//                           res.json([{ message: err }]);
//                         } else {
//                           res.json([
//                             { message: "verified", user: doc, token },
//                           ]);
//                           OtpObject.deleteMany({ number }).exec();
//                         }
//                       }
//                     );
//                   } else {
//                     res.json([{ message: "verified", user: null }]);
//                   }
//                 })
//                 .catch((err) => {
//                   res.json([{ message: "err" }]);
//                 });
//             }
//           }
//         );
//       } else {
//         res.json([{ message: "not matching" }]);
//       }
//     })
//     .catch((err) => {
//       res.json([{ message: "error" }]);
//     });
// } else {
//   res.json([{ message: "elements not found" }]);
// }
