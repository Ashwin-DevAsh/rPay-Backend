const jwt = require("jsonwebtoken");

module.exports = class Auth {
  isAuthenticated = async (req, res, next) => {
    try {
      var id = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY).id;
      next();
    } catch (e) {
      console.log(e);
      res.send({ message: "error" });
      return;
    }
  };

  isTransAuth = async (req, res, next) => {
    try {
      console.log("TransAuth");
      var decoded = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY);
      if (decoded.id != req.body.transactionData.from.id) {
        console.log(decoded.id + from.id);
        res.send({ message: "failed" });
        return;
      }
    } catch (e) {
      console.log(e);
      res.send({ message: "failed" });
      return;
    }
  };
};
