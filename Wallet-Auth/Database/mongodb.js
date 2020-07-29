const mongoose = require("mongoose");

mongoose
  .connect("mongodb://auth-database/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("suc");
  })
  .catch((err) => {
    console.log("Fail", err);
  });

mongoose.connection.on("disconnected", function () {
  console.log("Mongoose default connection is disconnected");
});

module.exports = mongoose;
