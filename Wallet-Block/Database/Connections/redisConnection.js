const redis = require("redis");

const client = redis.createClient({
  port: 6379,
  host: "wallet-cache",
});

client.on("error", (err) => {
  console.log(err);
});

module.exports = client;