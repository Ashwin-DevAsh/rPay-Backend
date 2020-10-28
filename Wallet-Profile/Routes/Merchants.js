const app = require("express").Router();
const jwt = require("jsonwebtoken");
const {Pool} = require("pg");
const clientDetails = require("../Database/ClientDetails")
const axios = require("axios");


var pool = new Pool(clientDetails)


app.post("/addMerchant", async (req, res) =>{
  var postgres =  await pool.connect()
  await addMerchant(postgres,req,res)
  ;(await postgres).release()  

});

app.get("/getMerchants", async (req, res) => {
  var postgres = await  pool.connect()
  await getMerchants(postgres,req,res)
  ;(await postgres).release()  

});

app.get("/getMerchant", async (req, res) => {
  var postgres = await  pool.connect()
  await getMerchant(postgres,req,res)
  ;(await postgres).release()  

});





var addMerchant = async (postgres,req,res)=>{
  var user = req.body;
  console.log(user);

  if (
    !user.name ||
    !user.email ||
    !user.number ||
    !user.password ||
    !user.fcmToken ||
    !user.storeName
  ) {
    res.status(200).send([{ message: "error" }]);
    return;
  }

  var userID = `rbusiness@${user.number}`;

  try {
    var otp = (
      await postgres.query(
        "select * from merchantsOtp where number = $1 and verified=true",
        [user.number]
      )
    ).rows;

    if (otp.length == 0) {
      res.json([{ message: "failed" }]);
      return;
    }

    var testUser = (
      await postgres.query(
        "select * from merchants where id = $1  or number = $2 or email = $3 ",
        [userID, user.number, user.email]
      )
    ).rows;

    if (testUser.length != 0) {
      res.json([{ message: "User already exist" }]);
      return;
    }
    await postgres.query("delete from info where id=$1;", [userID]);
    await postgres.query("delete from amount where id=$1;", [userID]);
    await postgres.query("insert into info values($1,$2,null,null)", [
      userID,
      user.fcmToken,
    ]);
    await postgres.query("insert into amount(id,balance) values($1,0)", [
      userID,
    ]);

    var token = jwt.sign(
      {
        name: user.name,
        id: userID,
        number: user.number,
        email: user.email,
      },
      process.env.PRIVATE_KEY
    );

    var blockResult = await axios.post(
      "http://wallet-block:9000/addUserBlock",
      {
        id: userID,
        initialAmount: 0,
      }
    );

    if ((blockResult.data["message"] = "done")) {
      await postgres.query(
        `insert into merchants(name,number,email,password,id,qrCode,storeName,status) values($1,$2,$3,$4,$5,$6,$7,'pending')`,
        [
          user.name,
          user.number,
          user.email,
          user.password,
          userID,
          user.qrCode,
          user.storeName,
        ]
      );
      res.json([{ message: "done", token }]);
      postgres.query(`delete from merchantsOtp where number=$1`, [user.number]);
    } else {
      res.json([{ message: "failed" }]);
    }
  } catch (err) {
    console.log(err);
    res.json([{ message: "failed" }]);
  }
}

var getMerchants = async (postgres,req,res)=>{
  try {
    var result = (
      await postgres.query(
        "select name,number,email,id,storeName from merchants where status='active'"
      )
    ).rows;
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send([{ message: "failed" }]);
  }
}

var getMerchant = async (postgres,req,res)=>{
  if (req.query.id) {
    var rows = (
      await postgres.query(
        "select name,number,email,id,storeName,status from merchants where id=$1",
        [req.query.id]
      )
    ).rows[0];
    res.status(200).send(rows);
  } else {
    console.log(err);
    res.json({ message: "failed" });
  }
}

module.exports = app;
