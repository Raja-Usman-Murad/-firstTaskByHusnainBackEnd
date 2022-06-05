const User = require("../model/UserSchema");

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
      const user = new User({ name, email, phone, work, password, cpassword });
      const authToken = await user.generateWebToken();
      const user2 = await user.save();
      return res.status(201).json({
        message: "user register successfully",
        authToken,
        success: "success",
        data: {
          user: user2,
        },
      });
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
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .json({ status: "fail", message: "plz fill all the fields" });
  }
  try {
    const findEmailandPass = await User.findOne({
      email: email,
      password: password,
    });

    if (!findEmailandPass) {
      return res
        .status(400)
        .json({ message: "doesnot find email", success: "fail" });
    } else {
      const authToken = await findEmailandPass.generateWebToken();
      return res
        .status(200)
        .json({ msg: "user signin successfull", authToken, success: true });
    }
  } catch (error) {
    console.log(error, "email and password fields empty");
    return res.status(400).json({
      message: `email and password fields empty : ${error}`,
      success: "fail",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id; //req.userId
    const user = await User.findById(userId, {
      //purpose (the purpose of func here is to get the full document of that user)
    }).select("-password");

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
