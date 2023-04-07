const mongoose = require("mongoose");
const buyOrderSchema = new mongoose.Schema({
    circleId: {
        type: mongoose.Types.ObjectId,
        ref: "BuyingCircle"
    },
    circle: {
        type: String,
        required: true
    },
    circleemail: {
        type: String,
        required: true
    },
    buyerId: {
        type: mongoose.Types.ObjectId,
        ref: "BuyingCircleMembers",
    },
    buyer: {
        type: String,
        required: true
    },
    buyeremail: {
        type: String,
    },
    products: [
        {
            name: {
                type: String,
                required: true,
            },
            minprice: {
                type: Number,
                required: true,
            },
            maxprice: {
                type: Number,
                required: true,
                default:100
            },
            category: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
        }
    ]
}, { timestamps: true })
module.exports = mongoose.model("BuyOrder", buyOrderSchema)