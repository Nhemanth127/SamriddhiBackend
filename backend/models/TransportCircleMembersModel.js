const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const TransportCircleMembersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: [true, "Please Enter Unqiue Email"],
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be greater than 8 characters"],
    },
    circlename: {
        type: String,
        required: true
    },
    circleemail: {
        type: String,
        required: true
    },
    circle: {
        type: mongoose.Schema.ObjectId,
        ref: "TransportCirlce",
    },
    address: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
        maxLength: [6, "PinCode cannot exceed 6 characters"],
        minLength: [6, "Picode should have atleast 6 characters"],
    },
    community: {
        type: String,
        // required: true
    },
    area: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

TransportCircleMembersSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
TransportCircleMembersSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare Password

TransportCircleMembersSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
TransportCircleMembersSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("TransportCircleMembers", TransportCircleMembersSchema);
