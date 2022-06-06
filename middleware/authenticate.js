const jwt = require("jsonwebtoken");
const User = require("../model/UserSchema");

const Authenticate = async (req, res, next) => {
  try {
    //1) Getting the token and check if its here

    //first way of getting token
    // const token = req.header("authorization");

    let token;
    if (
      //second way of getting token
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ status: "fail", message: "No Token Found" });
    }

    //2) Verification of token by jwt
    const verifyToken = jwt.verify(token, process.env.JWTKEY);

    if (!verifyToken) {
      return res
        .status(401)
        .json({ status: "fail", message: "token is not verified" });
    }

    //3) if User Still Exist
    const currentUser = await User.findById(verifyToken.user.id);
    console.log(currentUser);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belong to this token doesnot Exist.",
      });
    }

    //4) check if user changed password after the token was created
    //HERE changedPasswordAfter is instance method on UserSchema
    if (currentUser.changedPasswordAfter(verifyToken.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "User recently changed password! Please log in again.",
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = verifyToken.user;
    req.currentUser = currentUser;

    next();
  } catch (error) {
    console.log("authenticate.js ERROR", error);
    return res.status(401).json({
      status: "fail",
      message: "please Authenticate using a valid token",
    });
  }
};
module.exports = Authenticate;
