const app = require("express").Router();
const jwt = require("jsonwebtoken");
var api = require("clicksend");
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const axios = require("axios");

var pool = new Pool(clientDetails);

app.get("/getOtp", async (req, res) => {
  var postgres = await pool.connect();
  await sendOtp(postgres, req, res, "Otp", "TqUmly4458C");
  (await postgres).release();
});

app.get("/getOtpMerchant", async function (req, res) {
  var postgres = await pool.connect();
  await sendOtp(postgres, req, res, "MerchantsOtp", "zqS2Zvk7BhK");
  (await postgres).release();
});

app.post("/setOtp", async (req, res) => {
  var postgres = await pool.connect();
  await setOtp(postgres, req, res, "Otp", "users");
  (await postgres).release();
});

app.post("/setOtpMerchant", async (req, res) => {
  var postgres = await pool.connect();
  setOtp(postgres, req, res, "MerchantsOtp", "users", "rbusiness@");
  (await postgres).release();
});

var setOtp = async (postgres, req, res, otpTable, userTable, id = "rpay@") => {
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

    console.log(user);

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

var sendOtp = async (postgres, req, res, otpTable, appId) => {
  var number = req.query["number"];

  if (!number) {
    res.json([{ message: "failed" }]);
    return;
  }

  var otpNumber = Math.floor(1000 + Math.random() * 9000);
  var apiKey = "49c888fc-671a-11eb-8153-0200cd936042";

  // smsMessage.from = "Rpay";
  // smsMessage.to = `+${number}`;
  var smsbody = `<#> Rpay never calls you asking for otp. Sharing it with
                     anyone gives them full access to your Rpay wallet.
                     Your Login OTP is ${otpNumber} . ID: ${appId}`;
  // console.log({
  //   number,
  //   otpNumber,
  // });

  // var smsApi = new api.SMSApi(
  //   process.env.OTP_USERNAME,
  //   process.env.OTP_API_KEY
  // );
  // var smsCollection = new api.SmsMessageCollection();
  // smsCollection.messages = [smsMessage];

  try {
    var response = (
      await axios.post(
        `https://2factor.in/API/V1/${apiKey}/SMS/${number}/${otpNumber}`
      )
    ).data;

    // var response = (
    //   await axios.post(
    //     ` http://www.smsintegra.com/api/smsapi.aspx?uid=RECCHENNAIPROMO&pwd=25755&mobile=${number}&msg=${smsbody}&sid=RECEDU&type=0`
    //   )
    // ).data;
  } catch (e) {
    console.log(e);
  }

  try {
    await postgres.query(`delete from ${otpTable} where number = $1`, [number]);
    await postgres.query(`insert into ${otpTable} values($1,$2,false)`, [
      number,
      otpNumber,
    ]);
    // await smsApi.smsSendPost(smsCollection);
    res.json([{ message: "done" }]);
  } catch (err) {
    console.log(err);
    res.json([{ message: "failed", err }]);
  }
};

module.exports = app;
