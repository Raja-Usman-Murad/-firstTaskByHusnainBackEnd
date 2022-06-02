const express = require("express"); //for routing its require
const router = express.Router(); //routing
const User = require("../model/UserSchema");
const authenticate = require("../middleware/authenticate"); //for contact middleware authentication

// 1)
router.get("/", (req, res) => {
    res.send("WELCOME TO HOME PAGE");
  });

  // 2) make user registartion route localhost:5000/register
router.post("/register", async (req, res) => {
    const { name, email, phone, work, password, cpassword } = req.body;
    if (!name || !email || !phone || !work || !password || !cpassword) {
      return res.status(422).json({ error: "plz fill all the fields" });
    }
    try {
      const userExist = await User.findOne({ email: email });
      if (userExist) {
        return res.status(422).json({ error: "Email Already exist",success:false });
      } else if (password != cpassword) {
        return res.status(422).json({ error: "password not match",success:false });
      } else {
        const user = new User({ name, email, phone, work, password, cpassword });
        const authToken = await user.generateWebToken();
        // is jaga pr humy hash krna hay password save sy pehly
       const user2 =  await user.save();
        res.status(201).json({ message: "user register successfully",authToken,success:true});
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Some error Ocuured')
    }
  });

    // 3) make user signin route localhost:5000/signin
  router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "plz fill all the fields", success:false });
    }
    try {
      const emailAuth = await User.findOne({ email: email });
      if (emailAuth) {
        const isMatch = await User.findOne({ password: password });
        
        if (!isMatch) {
          res.status(400).json({ error: "invalid credentials pass", success:false });
        } else {
          const authToken = await emailAuth.generateWebToken();
          res.status(200).json({ msg: "user signin successfull" , authToken, success:true});
        }
      } else {
        res.status(400).json({ error: "invalid credentials email", success:false });
      }
    } catch (error) {
      console.log(error, "email and password fields empty");
    }
  });

      // 4) getuser localhost:5000/getuser
  router.get("/getuser", authenticate, async (req, res) => {
    try {
          // res.send("WELCOME TO getUserPage PAGE");
    userId = req.user.id //req.userId
    const user = await User.findById(userId).select("-password")
    res.send(user);
    } catch (error) {
      res.status(500).send("interval server error");
    }
  });

        // 5) authenticate list page localhost:5000/list
  router.get("/list", authenticate, async (req, res) => {
    // res.send("WELCOME TO list PAGE");
    res.send(req.rootUser);
  });

  module.exports = router;