require("dotenv").config(".env");

const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const postgres = require("./Database");
const FCM = require("fcm-node");

io.on("connection", (client) => {
  client.on("getInformation", (data) => {
    var id = data["id"];
    var token = data["fcmToken"];
    client.join(id, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log(id, token);
    updateOnline(id, client.id, token, true);
  });

  client.on("disconnect", async () => {
    var token = await postgres.query(
      "select fcmToken from info where socketid = $1",
      [client.id]
    );

    var token = token.rows[0].fcmtoken;

    sendNotification(token);

    updateOffline(client.id);
  });

  client.on("notifyPayment", (data) => {
    console.log(data);
    io.to(data["to"]).emit("receivedPayment");
  });
});

function sendNotification(device) {
  console.log("sending notification to ", device);
  var serverKey = process.env.FCM_KEY; //put your server key here
  var fcm = new FCM(serverKey);
  var message = {
    to: device,
    data: {
      type: "awake",
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

async function updateOnline(id, socketID, fcmToken, isOnline) {
  var insertStatement = `update info set isonline=$4 , socketid=$2 , fcmToken = $3  where id=$1`;
  sendNotification(fcmToken);
  try {
    await postgres.query(insertStatement, [id, socketID, fcmToken, isOnline]);
  } catch (e) {
    console.log(e);
  }
}

async function updateOffline(socketID) {
  insertStatement = `update info set socketid=null , isonline=false where socketid=$1`;
  try {
    await postgres.query(insertStatement, [socketID]);
  } catch (e) {
    console.log(e);
  }
}

server.listen(7000, () => {
  console.log("Listing at 7000");
});

console.log("Last....");
