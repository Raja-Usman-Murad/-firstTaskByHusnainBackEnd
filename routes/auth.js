const express = require("express"); //for routing its require
const router = express.Router(); //routing
const authenticate = require("../middleware/authenticate"); //for contact middleware authentication
const authController = require("../controllers/authController");

// make user registartion route localhost:5000/register
router.post("/register", authController.registerUser);

//  make user signin route localhost:5000/signin
router.post("/signin", authController.signInUser);

//  getuser localhost:5000/getuser
router.get("/getuser", authenticate, authController.getUser);

//  getAllUsers localhost:5000/getAllUser
router.get("/getAllUsers", authController.getAllUsers);

// updateUser localhost:5000/updateUser
router.patch("/updateUser", authenticate, authController.updateUser);

// updatePassword localhost:5000/updatePassword
router.patch("/updatePassword", authenticate, authController.updatePassword);

// forgetPassword localhost:5000/forgotPassword
router.post("/forgotPassword", authController.forgotPassword);

// resetPassword localhost:5000/resetPassword
router.patch("/resetPassword/:resetId", authController.resetPassword);

// deleteUser localhost:5000/deleteUser
router.delete("/deleteUser", authenticate, authController.deleteUser);

module.exports = router;
