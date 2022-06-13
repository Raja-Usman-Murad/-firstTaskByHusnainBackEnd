const mongoose = require("mongoose"); //for creating mschema and model
const jwt = require("jsonwebtoken"); //for producing token
const bcrypt = require("bcryptjs"); //for hashing password
const crypto = require("crypto"); //for hashing token its built-in

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must have username"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "must have email"],
    unique: true,
    trim: true,
  },
  photo: {
    type: String,
  },
  phone: {
    type: Number,
    required: [true, "must have phoneNumber"],
  },
  work: {
    type: String,
    required: [true, "must have work"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
    //hashing
  },
  cpassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// WE ARE HASHING THE PASSWORD
userSchema.pre("save", async function (next) {
  //isModified tb use krty hain q ky jb b koi field add yah change ho ge tu pre save middleware run ho ga hamy sirf us wqt run krna hy jb sirf password add yah update ho tb is lye isModified use kr rhy hain
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  //now delete the confirm password field because our password has been hashed
  this.cpassword = undefined;
  // this.cpassword = await bcrypt.hash(this.cpassword, 12);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// GENERATING WEB TOKEN(INSTANCE METODS)
userSchema.methods.generateWebToken = async function () {
  try {
    const data = {
      user: {
        id: this._id,
      },
    };
    let token = jwt.sign(data, process.env.JWTKEY, {
      expiresIn: process.env.JWTEXPIRY,
    });
    // this.tokens = this.tokens.concat({ token: token });
    // await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// Check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

//Generate the random reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
//findOneAndUpdate, save , update, updateOne,  schem(pre) ? , this.isModified ?? only passwrod update per usy convert kysy krna a ??

const User = mongoose.model("User", userSchema);
module.exports = User;
