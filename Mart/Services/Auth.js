const jwt = require("jsonwebtoken");


class Auth {
  isAuthenticated = (req, res, next) => {
    try {
        var id = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY).id;
        next();

    } catch (e) {
        console.log(e);
        res.send({ message: "error" });
        return;
    }
  };
}

export default Auth
