const express = require("express"); //for routing its require
const router = express.Router(); //routing
const User = require("../model/userSchema");
const authenticate = require("../middleware/authenticate"); //for contact middleware authentication
router.get("/", (req, res) => {
    res.send("WELCOME TO HOME PAGE");
  });

router.post("/register", async (req, res) => {
    const { name, email, phone, work, password, cpassword } = req.body;
    if (!name || !email || !phone || !work || !password || !cpassword) {
      return res.status(422).json({ error: "plz fill all the fields" });
    }
    try {
      const userExist = await User.findOne({ email: email });
      if (userExist) {
        return res.status(422).json({ error: "Email Already exist" });
      } else if (password != cpassword) {
        return res.status(422).json({ error: "password not match" });
      } else {
        const user = new User({ name, email, phone, work, password, cpassword });
        // is jaga pr humy hash krna hay password save sy pehly
        await user.save();
        res.status(201).json({ message: "user register successfully" });
      }
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "plz fill all the fields" });
    }
    try {
      const emailAuth = await User.findOne({ email: email });
      if (emailAuth) {
        const isMatch = await User.findOne({ password: password });
        const token = await emailAuth.generateWebToken();
        res.cookie("mytoken", token, {
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
        });
        if (!isMatch) {
          res.status(400).json({ error: "invalid credentials pass" });
        } else {
          res.status(200).json({ msg: "user signin successfull" });
        }
      } else {
        res.status(400).json({ error: "invalid credentials email" });
      }
    } catch (error) {
      console.log(error, "email and password fields empty");
    }
  });

  router.get("/list", authenticate, async (req, res) => {
    // res.send("WELCOME TO list PAGE");
    res.send(req.rootUser);
  });

  module.exports = router;