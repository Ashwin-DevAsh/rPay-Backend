const multer = require("multer");

export class ProductsPictureController {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "../profilePictures/");
    },
    filename: function (req, file, cb) {
      var id = req.params.id;
      cb(null, `${id}.jpg`);
    },
  });

  upload = multer({
    storage: this.storage,
  }).single("productPictures");

  addProductPicture = (req, res) => {
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

  getProductPicture = () => {};
}
