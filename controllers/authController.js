const User = require("../model/UserSchema");
const sendEmail = require("../utils/email");
const crypto = require("crypto"); //for hashing token its built-in

const createSendToken = async (user, statusCode, res) => {
  const authToken = await user.generateWebToken();
  console.log(authToken);
  console.log(process.env.JWT_COOKIE_EXPIRES_IN);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", authToken, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    authToken,
    data: {
      user,
    },
  });
};

exports.registerUser = async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;
  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res
      .status(422)
      .json({ status: "fail", message: "plz fill all the fields" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res
        .status(422)
        .json({ status: "fail", message: "user already exist" });
    } else if (password != cpassword) {
      return res
        .status(422)
        .json({ status: "fail", message: "p doesnot match" });
    } else {
      const user = await User.create({
        name,
        email,
        phone,
        work,
        password,
        cpassword,
      });
      // here the PASSWORD hasing occur automaticall on pre save middleware

      // generate webToken //generateWebToken is instance in userSchema
      createSendToken(user, 201, res);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `Some error Ocuured : ${error}`,
      status: "fail",
    });
  }
};

exports.signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(422)
        .json({ status: "fail", message: "plz fill all the fields" });
    }

    const user = await User.findOne({
      email: email,
    }).select("+password");

    // PASSWORD HASH (correctPassword instance method on User Schema)
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res
        .status(401)
        .json({ message: "inValid Credentials", success: "fail" });
    }

    // generate webToken //generateWebToken is instance in userSchema
    createSendToken(user, 201, res);
  } catch (error) {
    console.log(error, "inValid Credentials");
    return res.status(401).json({
      message: `inValid Credentials ${error}`,
      success: "fail",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id; //req.userId

    // const user = await User.findById(userId, {
    //   //purpose (the purpose of func here is to get the full document of that user)
    // }).select("-password");

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: `user not found`,
        success: "fail",
      });
    }

    return res.status(200).json({
      message: `user found`,
      success: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `internal server error ${error}`,
      success: "fail",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find({ active: { $ne: false } });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
};

exports.forgotPassword = async (req, res) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      message: `There is no user with email address.`,
      success: "fail",
    });
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  //validateBeforeSave: false (its for not validate fields)
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: `There was an error sending the email. Try again later!`,
      success: "fail",
    });
  }
};

exports.resetPassword = async (req, res) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).json({
      message: `Token is invalid or has expired`,
      success: "fail",
    });
  }
  user.password = req.body.password;
  user.cpassword = req.body.cpassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
};
