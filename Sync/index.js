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
      client.emit("doUpdate");
      updateOnline(token);
    } catch (err) {
      console.log(err);
    }
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

async function updateOnline(fcmToken) {
  var postgres = await pool.connect();
  var insertStatement = `update users set fcmToken = $1  where id=$1`;
  try {
    await postgres.query(insertStatement, [fcmToken]);
  } catch (e) {
    console.log(e);
  }
  postgres.release();
}

server.listen(7000, () => {
  console.log("Listing at 7000");
});

console.log("Last....");
