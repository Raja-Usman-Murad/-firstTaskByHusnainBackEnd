const jwt = require("jsonwebtoken");
const Authenticate = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    console.log(token);

    if (!token) {
      return res
        .status(401)
        .json({ status: "fail", message: "No Token Found" });
    }
    const verifyToken = jwt.verify(token, process.env.JWTKEY);

    if (!verifyToken) {
      return res
        .status(401)
        .json({ status: "fail", message: "token is not verified" });
    }
    req.user = verifyToken.user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: "fail",
      message: "please Authenticate using a valid token",
    });
  }
};
module.exports = Authenticate;
