const app = require("express").Router();
var api = require("clicksend");
const jwt = require("jsonwebtoken");
const {Pool} = require("pg");
const clientDetails = require("../Database/ClientDetails")

var pool = new Pool(clientDetails)


app.get("/getRecoveryOtp", async function (req, res) {
  
     var postgres = await pool.connect()
     await sendOtp(postgres,req, res, "recoveryOtp");
     (await postgres).release()
  });

app.get("/getRecoveryOtpMerchant", async(req, res) =>{
  var postgres = await pool.connect()
  await sendOtp(postgres,req, res, "recoveryMerchantsOtp");
  (await postgres).release()
  }
);

app.post("/setRecoveryOtp", async (req, res) => {
  var postgres =  await pool.connect()
  await setOtp(postgres,req, res, "recoveryOtp");
  (await postgres).release()

});
app.post("/setRecoveryOtpMerchant", async(req, res) => {
  var postgres = await pool.connect()
  await setOtp(postgres,req, res, "recoveryMerchantsOtp");
  (await postgres).release()
  }
);

app.post("/newPassword", async(req, res) =>
  {
    var postgres = await  pool.connect()
    await newPassword(postgres,req, res, "recoveryOtp", "Users");
    (await postgres).release()
  }
);
app.post("/newPasswordMerchant", async(req, res) =>
 {
    var postgres = await pool.connect()
    await newPassword(postgres,req, res, "recoveryMerchantsOtp", "Merchants");
    (await postgres).release()
  }
);

app.post("/changePassword", async (req, res) => {
  var postgres = await pool.connect()
  await changePassword(postgres,req, res, "users");
  (await postgres).release()
});
app.post("/changeMerchantPassword", async (req, res) => {
  var postgres = await pool.connect()
  await changePassword(postgres,req, res, "merchants");
  (await postgres).release()
});

var changePassword = async (postgres,req, res, tableName) => {

  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "failed" });
     return
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
};

var newPassword = async(postgres,req, res, otpTable, userTable) => {


  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "error" });
     return
   }

      console.log("Changing password...");
      var data = req.body;
      console.log(data);
      if (!data.id || !data.newPassword || !data.emailID) {
        res.status(200).send({ message: "error", err: "Invalid credientials" });
        return;
      }

      try {
        var otp = (
          await postgres.query(
            `select * from ${otpTable} where email = $1 and verified=true`,
            [data.emailID]
          )
        ).rows;

        if (otp.length == 0) {
          res.status(200).send({ message: "otp not verified" });
          return;
        }

        await postgres.query(
          `update ${userTable} set password = $2 where id = $1`,
          [data.id, data.newPassword]
        );

        await postgres.query(`delete from ${otpTable} where email = $1`, [
          data.email,
        ]);

        res.status(200).send({ message: "done" });
      } catch (err) {
        console.log(err);
        res.status(200).send({ message: "error" });
      }
};

var sendOtp = async (postgres,req, res, otpTable) => {
  console.log("getting recovery otp");
  var emailID = req.query["emailID"];
  var otpNumber = Math.floor(1000 + Math.random() * 9000);


  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "error" });
     return
   }


      console.log("Recovery password...");
      if (emailID) {
        var emailTransactionalApi = new api.TransactionalEmailApi(
          process.env.OTP_USERNAME,
          process.env.OTP_API_KEY
          // "ajaykrishnan.s.2018.cse@rajalakshmi.edu.in",
          // "2617172A-B44A-4C96-7BA9-D9746E9D3230"
        );

        var emailRecipient = new api.EmailRecipient();
        emailRecipient.email = emailID;
        emailRecipient.name = "r pay";

        var emailFrom = new api.EmailFrom();
        emailFrom.emailAddressId = 12701;
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
   
};

var setOtp = async(postgres,req, res, otpTable) => {
  var otpNumber = req.body["otpNumber"];
  var emailID = req.body["emailID"];
  console.log(emailID);


  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "error" });
     return
   }

 
      if (!otpNumber || !emailID) {
        res.json([{ message: "elements not found" }]);
        return;
      }

      try {
        var result = (
          await postgres.query(
            `select * from ${otpTable} where otp = $1 and email = $2`,
            [otpNumber, emailID]
          )
        ).rows;

        if (result.length == 0) {
          res.json([{ message: "not matching" }]);
          return;
        }

        await postgres.query(
          `update ${otpTable} set verified = true where email = $1`,
          [emailID]
        );
        res.json([{ message: "done" }]);
      } catch (err) {
        console.log(err);
        res.json([{ message: "error" }]);
      }
};

module.exports = app;

