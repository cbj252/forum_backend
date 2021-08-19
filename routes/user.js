var express = require("express");
var router = express.Router();

var userController = require("../controllers/userController");

router.post("/signUp", userController.signUp_post);
router.post("/login", userController.login_post);

module.exports = router;
