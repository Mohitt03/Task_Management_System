const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { ref } = require("joi");


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  company_Id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  status: { type: String, default: "inactive", enum: ["inactive", "active"] },

  role: {
    type: String,
    enum: ["S_Admin", "Admin", "User"],
    required: true
  },
  refreshToken: {
    type: String
  },
  otp: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}




userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      company_id: this.company_Id
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

module.exports = mongoose.model("User", userSchema);