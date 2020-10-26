const app = require("express").Router();
const jwt = require("jsonwebtoken");
var api = require("clicksend");
const postgres = require("../Database/postgresql");
var smsMessage = new api.SmsMessage();

app.get("/getOtp", async(req, res) =>{ 
  postgres.connect()
  await sendOtp(req, res, "Otp", "aGok1vSGlpf")
  postgres.end()

});

app.get("/getOtpMerchant", (req, res) =>{
  postgres.connect()
  sendOtp(req, res, "MerchantsOtp", "Uf4HyXRcQ7x")
  postgres.end()
}
);

app.post("/setOtp", (req, res) => {
  postgres.connect()
  setOtp(req, res, "Otp", "users");
  postgres.end()
});

app.post("/setOtpMerchant", (req, res) => {
  postgres.connect()
  setOtp(req, res, "MerchantsOtp", "merchants", "rbusiness@");
  postgres.end()

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

    await postgres.query(
      `update ${otpTable} set verified = true where number = $1`,
      [number]
    );

    var user = (
      await postgres.query(`select * from ${userTable} where id = $1`, [
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
        id: id + user[0].number,
      },
      process.env.PRIVATE_KEY
    );
    res.json([{ message: "verified", user: user[0], token: userToken }]);
    postgres.query(`delete from ${otpTable} where number=$1`, [number]);
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
    await postgres.query(`insert into ${otpTable} values($1,$2,false)`, [
      number,
      otpNumber,
    ]);
    var sms = await smsApi.smsSendPost(smsCollection);
    console.log(sms);
    res.json([{ message: "done" }]);
  } catch (err) {
    console.log(err);
    res.json([{ message: "failed", err }]);
  }
};

module.exports = app;
