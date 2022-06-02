const mongoose = require("mongoose"); //for creating mschema and model
const jwt = require("jsonwebtoken"); //for producing token


const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique:true,
    },
    phone: {
      type: Number,
      required: true,
    },
    work: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    cpassword: {
      type: String,
      required: true,
    },
    tokens:[
      {
        token:{
          type:String
        }
      }
    ]
  });

// GENERATING WEB TOKEN
userSchema.methods.generateWebToken = async function () {
  try {
    const data = {
      user:{
        id:this._id
      }
    }
    let token = jwt.sign(data, "rajausmanmuradkiyaniilovemyselfverymuch");
    // this.tokens = this.tokens.concat({ token: token });
    // await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("user", userSchema);
module.exports = User;