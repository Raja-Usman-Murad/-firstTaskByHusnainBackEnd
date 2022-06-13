const multer = require("multer");
const sharp = require("sharp");
const User = require("../model/UserSchema");
const Email = require("../utils/email");
const crypto = require("crypto"); //for hashing token its built-in

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const createSendToken = async (user, statusCode, res) => {
  const authToken = await user.generateWebToken();

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

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("ERRRO MULTER", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single("photo");
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${Math.random()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};
exports.registerUser = async (req, res) => {
  const { name, email, phone, work, password, cpassword, photo } = req.body;
  if (!name || !email || !phone || !work || !password || !cpassword || !photo) {
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
    } //else if (!req.file) {
    //   return res
    //     .status(422)
    //     .json({ status: "fail", message: "file doesnot found" });
    // }
    else {
      // console.log("file", req.file.filename);
      const user = await User.create({
        name,
        email,
        phone,
        work,
        password,
        cpassword,
        photo,
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
    if (
      !user ||
      !(await user.correctPassword(req.body.password, user.password))
    ) {
      return res
        .status(401)
        .json({ message: "inValid Credentials", success: "fail" });
    }

    // generate webToken //generateWebToken is instance in userSchema
    createSendToken(user, 201, res);
  } catch (error) {
    console.log(error, "inValid Credentialsssssssss");
    return res.status(401).json({
      message: `inValid Credentials ${error}`,
      success: "fail",
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if POSTed current password is correct
    // PASSWORD HASH (correctPassword instance method on User Schema)
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res.status(401).json({
        message: `Your current password is wrong.`,
        success: "fail",
      });
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.cpassword = req.body.cpassword;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
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
  return res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
};

exports.updateUser = async (req, res) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        message: `This route is not for password updates. Please use /updatePassword`,
        success: "fail",
      });
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      "name",
      "email",
      "phone",
      "profession",
      "photo"
    );

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `User Data Not Update ${error}`,
      success: "fail",
    });
  }
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
  try {
    const resetURL = `http://127.0.0.1:3000/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: `There was an error sending the email. Try again later! ${err}`,
      success: "fail",
    });
  }
};

exports.resetPassword = async (req, res) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetId)
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
