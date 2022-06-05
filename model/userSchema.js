const mongoose = require("mongoose"); //for creating mschema and model
const jwt = require("jsonwebtoken"); //for producing token

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
    //hashing
    select: false,
  },
  cpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

// GENERATING WEB TOKEN
userSchema.methods.generateWebToken = async function () {
  try {
    const data = {
      user: {
        id: this._id,
      },
    };
    let token = jwt.sign(data, process.env.JWTKEY);
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
