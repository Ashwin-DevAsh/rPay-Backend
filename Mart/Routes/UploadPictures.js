const jwt = require("jsonwebtoken");
const app = require("express").Router();

app.post("/addProductPictures/:id", async (req, res) => {
  await addProfilePicture(req, res);
});

app.get("/getProductPictures/:imageName", async (req, res) => {
  var imageName = req.params.imageName;
  console.log(imageName);
  res.download("../productPictures/" + imageName);
});

var addProfilePicture = async (req, res) => {
  try {
    var id = await jwt.verify(req.get("token"), process.env.PRIVATE_KEY).id;
  } catch (e) {
    console.log(e);
    res.send({ message: "error" });
    return;
  }

  upload(req, res, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ message: "error", err });
    } else if (!req.file) {
      res.send({ message: "error", err: "Invalid file" });
    } else {
      res.send({
        message: "done",
        result: result,
        path: "path = " + this.path,
      });
    }
  });
};

module.exports = app;
