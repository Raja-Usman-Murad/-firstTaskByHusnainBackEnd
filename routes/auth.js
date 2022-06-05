const express = require("express"); //for routing its require
const router = express.Router(); //routing
const authenticate = require("../middleware/authenticate"); //for contact middleware authentication
const authController = require("../controllers/authController");

// 2) make user registartion route localhost:5000/register
router.post("/register", authController.registerUser);

// 3) make user signin route localhost:5000/signin
router.post("/signin", authController.signInUser);

// 4) getuser localhost:5000/getuser
router.get("/getuser", authenticate, authController.getUser);

module.exports = router;
