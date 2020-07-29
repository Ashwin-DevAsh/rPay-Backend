require("dotenv").config(".env");

const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const postgres = require("./Database");

io.on("connection", (client) => {
  console.log("connected ", client.id);

  client.on("getInformation", (data) => {
    var id = data["id"];
    var token = data["fcmToken"];
    console.log(id, token);
  });
});

server.listen(7000, () => {
  console.log("Listing at 7000");
});
