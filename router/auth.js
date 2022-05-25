const express = require("express"); //for routing its require
const router = express.Router(); //routing
const User = require("../model/userSchema");

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


  module.exports = router;