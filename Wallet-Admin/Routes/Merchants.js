const app = require("express").Router();
const FCM = require("fcm-node");
const jwt = require("jsonwebtoken");
const {Pool} = require("pg");
const clientDetails = require("../Database/ClientDetails")

app.get("/getMerchants", (req, res) => {
  var postgres = new Pool(clientDetails)
  postgres.connect()
  await getMerchants(postgres,req,res)
  postgres.end()
});


var getMerchants = async(postgres,req,res)=>{
  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "failed" });
     return
   }

  try {
    var users = (await postgres.query("select * from merchants")).rows;
    res.send(users);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
}

app.post("/updateMerchantStatus", (req, res) => {
  var postgres = new Pool(clientDetails)
  postgres.connect()
  updateMerchantStatus(postgres,req,res)
  postgres.end()
});


var updateMerchantStatus = async(postgres,req,res)=>{
  try{
    var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY)
   }catch(e){
     console.log(e)
     res.send({ message: "failed" });
     return
   }


  var id = req.body.id;
  var status = req.body.status;
  console.log(id, status);
  if (!id || !status) {
    res.send({ message: "error" });
    return;
  }

  try {
    await postgres.query("update merchants set status = $2 where id=$1", [
      id,
      status,
    ]);
    sendNotificationToAll(id, status);
    res.send({ message: "done" });
  } catch (e) {
    res.send({ message: "error", e });
  }
}

function sendNotificationToAll(id, isActive) {
  console.log("sending notification to all merchant");
  var serverKey = process.env.FCM_KEY;
  var fcm = new FCM(serverKey);
  console.log(serverKey);
  var message = {
    to:"/topics/all",
    data: {
      type: `merchantStatus,${id},${isActive}`,
    },
  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

module.exports = app;
