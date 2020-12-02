require("dotenv").config({ path: "./env/.env" });

const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { Pool } = require("pg");
const clientDetails = require("../Database/ClientDetails");
const FCM = require("fcm-node");

var pool = new Pool(clientDetails);

io.on("connection", (client) => {
  client.on("getInformation", (data) => {
    try {
      var id = data["id"];
      var token = data["fcmToken"];
      client.join(id, (err) => {
        if (err) {
          console.log(err);
        }
      });
      console.log(id, token);
      client.emit("doUpdate");
      updateOnline(id, client.id, token, true);
    } catch (err) {
      console.log(err);
    }
  });

  client.on("disconnect", async () => {
    try {
      updateOffline(client.id);
    } catch (err) {}
  });

  client.on("notifyPayment", (data) => {
    io.to(data["to"]).emit("receivedPayment");
  });

  client.on("notifySingleObjectTransaction", (data) => {
    try {
      console.log("payment notification");
      io.to(data["to"]["id"]).emit("receivedSingleObjectTransaction", data);
      io.to(data["from"]["id"]).emit("receivedSingleObjectTransaction", data);
    } catch (err) {
      console.log(err);
    }
  });

  client.on("notifyMessage", (data) => {
    io.to(data["to"]["id"]).emit("receivedMessage", data);
  });

  client.on("updateProfilePicture", (data) => {
    sendNotificationToAll(data.id);
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

function sendNotificationToAll(id) {
  console.log("sending notification to all");
  var serverKey = process.env.FCM_KEY; //put your server key here
  var fcm = new FCM(serverKey);
  var message = {
    condition: "!('anytopicyoudontwanttouse' in topics)",
    data: {
      type: `updateProfilePicture,${id}`,
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
  var postgres = await pool.connect();
  var insertStatement = `update info set isonline=$4 , socketid=$2 , fcmToken = $3  where id=$1`;
  try {
    await postgres.query(insertStatement, [id, socketID, fcmToken, isOnline]);
  } catch (e) {
    console.log(e);
  }
  postgres.release();
}

async function updateOffline(socketID) {
  var postgres = await pool.connect();
  insertStatement = `update info set socketid=null , isonline=false where socketid=$1`;
  try {
    await postgres.query(insertStatement, [socketID]);
  } catch (e) {
    console.log(e);
  }
  postgres.release();
}

server.listen(7000, () => {
  console.log("Listing at 7000");
});

console.log("Last....");
