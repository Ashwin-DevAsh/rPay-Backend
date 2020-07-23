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

module.exports = mongoose;
