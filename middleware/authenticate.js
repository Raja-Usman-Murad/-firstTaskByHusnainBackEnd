const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const Authenticate = async (req, res, next) => {
  try {
    console.log("before getting token");
    const token = req.cookies.mytoken;
    console.log(token);
    console.log("after getting token");
    const verifyToken = jwt.verify(token, "rajausmanmuradkiyaniilovemyselfverymuch");
    console.log(verifyToken);
    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!verifyToken) {
      throw new Error("User not found");
    }
    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;
    console.log(req.cookies);
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: no token provided");
    console.log(error);
  }
};
module.exports = Authenticate;