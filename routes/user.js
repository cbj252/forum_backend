var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

var userController = require("../controllers/userController");

router.get("/", userController.users_get);
router.post("/signUp", userController.signUp_post);
router.post("/login", userController.login_post);

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

router.get("/current", userController.user_current_get);
router.post("/admin/:id/make", userController.admin_make_post);
router.post("/admin/:id/remove", userController.admin_remove_post);

module.exports = router;
