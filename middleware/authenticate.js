const jwt = require("jsonwebtoken");
const User = require("../model/UserSchema");
const Authenticate = async (req, res, next) => {
  try {
    const token = req.header('auth-token');
    if(!token) {
      return res.status(401).send({error:"please Authenticate using a valid token"})
    }
    const verifyToken = jwt.verify(token, "rajausmanmuradkiyaniilovemyselfverymuch");
    req.user = verifyToken.user
    // const rootUser = await User.findOne({
    //   _id: verifyToken._id,
    //   "tokens.token": token,
    // });
    // if (!verifyToken) {
    //   throw new Error("User not found");
    // }
    // req.token = token;
    // req.rootUser = rootUser;
    // req.userId = rootUser._id;
    // console.log(req.cookies);
    // console.log('MIDDLEWARE END');
    next();
  } catch (error) {
    return res.status(401).send({error:"please Authenticate using a valid token"})
    console.log(error);
  }
};
module.exports = Authenticate;