const FCM = require("fcm-node");
const clientDetails = require("../Database/ClientDetails");

const { Pool } = require("pg");
var pool = new Pool(clientDetails);

module.exports = async function sendNotificationToAll(userID, data) {
  var postgres = await pool.connect();
  var fcmToken = (
    await postgres.query("select fcmtoken from info where id = $1", [userID])
  ).rows[0].fcmtoken;
  await postgres.release();

  var serverKey = process.env.FCM_KEY;
  var fcm = new FCM(serverKey);

  console.log(serverKey);
  var message = {
    to: fcmToken,
    data: {
      type: data,
    },
  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};
