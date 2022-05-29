var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");

var indexController = require("../controllers/indexController");

router.use(function (req, res, next) {
  if (!req.headers.authorization) {
    res.json("No authentication included in Request.");
  } else {
    const givenToken = req.headers.authorization.split(" ")[1];
    jwt.verify(givenToken, "secretKey", (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        res.locals.currentUser_id = authData.id;
        next();
      }
    });
  }
});

router.get("/threads", indexController.threads_get);
router.post("/threads", indexController.threads_post);
router.get("/threads/:id", indexController.posts_get);
router.get("/threads/:id/count", indexController.postCount_get);
router.post("/threads/:id", indexController.posts_post);
router.post("/threads/:id/edit", indexController.posts_edit_post);
router.post("/threads/:id/delete", indexController.posts_delete_post);
module.exports = router;
