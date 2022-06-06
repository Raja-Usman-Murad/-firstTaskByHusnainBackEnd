const mongoose = require("mongoose"); //for creating mschema and model
const jwt = require("jsonwebtoken"); //for producing token
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: Number,
    required: true,
    trim: true,
  },
  work: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
    //hashing
  },
  cpassword: {
    type: String,
    required: true,
    select: false,
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
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

//findOneAndUpdate, save , update, updateOne,  schem(pre) ? , this.isModified ?? only passwrod update per usy convert kysy krna a ??

const User = mongoose.model("User", userSchema);
module.exports = User;
