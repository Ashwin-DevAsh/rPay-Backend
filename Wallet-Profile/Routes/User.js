const app = require("express").Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");

const {Pool} = require("pg");
const clientDetails = require("../Database/ClientDetails")

var pool = new Pool(clientDetails)


app.post("/addUser", async (req, res) => {
  var postgres = await pool.connect()
   await addUser(postgres,req,res)
   ;(await postgres).release()
});

app.get("/getUsers", async (req, res) => {
  var postgres = await pool.connect()

  await getUser(postgres,req,res)
  ;(await postgres).release()
 
});

app.post("/getUsersWithContacts", async (req, res) => {
  console.log(req.body)
  var contacts = req.body["contacts"]
  var postgres = await pool.connect()

  await getUsersWithContacts(postgres,contacts,req,res);
  (await postgres).release()
 
});


var addUser = async (postgres,req,res)=>{
  {
    var user = req.body;
    console.log(user);
    if (
      !user.name ||
      !user.email ||
      !user.number ||
      !user.password ||
      !user.fcmToken ||
      !user.qrCode
    ) {
      res.status(200).send([{ message: "error" }]);
      return;
    }
    var userID = `rpay@${user.number}`;
  
    try {
      var otp = (
        await postgres.query(
          "select * from otp where number = $1 and verified=true",
          [user.number]
        )
      ).rows;
  
      if (otp.length == 0) {
        res.json([{ message: "failed" }]);
        return;
      }
  
      var testUser = (
        await postgres.query(
          "select * from users where id = $1 or number = $2 or email = $3 ",
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
          `insert into users(name,number,email,password,id,qrCode) values($1,$2,$3,$4,$5,$6)`,
          [user.name, user.number, user.email, user.password, userID, user.qrCode]
        );
        res.json([{ message: "done", token }]);
        postgres.query(`delete from otp where number=$1`, [user.number]);
      } else {
        res.json([{ message: "failed" }]);
      }
    } catch (err) {
      console.log(err);
      res.json([{ message: "failed" }]);
    }
  }
}

var getUser = async(postgres,req,res)=>{
  try {
    var result = (
      await postgres.query("select name,number,email,id from users")
    ).rows;
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send([{ message: "failed" }]);
  }
}

var getUsersWithContacts = async(postgres,contacts,req,res)=>{
  contacts = contacts.replace("[","{").replace("]","}")
  try {
    var result = (
      await postgres.query("select name,number,email,id from users where number = Any("+contacts+")")
    ).rows;
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send([{ message: "failed" }]);
  }
}


module.exports = app;
