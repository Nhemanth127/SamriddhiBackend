const TransportCircle = require("../models/TransportCircleModel")
const TransportCircleMembers = require("../models/TransportCircleMembersModel")
const Notifications = require("../models/NotificationsModel")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler")
const sendToken = require("../utils/jwtToken");
const FinalorderModel = require("../models/FinalorderModel");
const OrderMatchModel = require("../models/OrderMatchModel");
const BuyOrdersAggregationModel = require("../models/BuyOrdersAggregationModel");
const BuyOrderModel = require("../models/BuyOrderModel");

// get all existing transport circles
exports.getAllTransportcircles = catchAsyncErrors(async (req, res, next) => {
    const circles = await TransportCircle.find({}, { circlename: 1 })
    res.status(200).json({
        circles
    })
})

// Register a Circle
exports.registerCirlce = catchAsyncErrors(async (req, res, next) => {
    const circle = new TransportCircle(
        req.body
    )
    await circle.save()
    sendToken(circle, 201, res);
});

// Login as Admin
exports.adminLogin = catchAsyncErrors(async (req, res, next) => {
    const { circlename, circleemail, password } = req.body
    if (!circlename || !circleemail || !password) {
        return next(new ErrorHandler("Please Enter Circle-Name Email & Password", 400));
    }
    const circle = await TransportCircle.findOne({
        circleemail,
        circlename
    })
    // console.log(circle);
    if (!circle) {
        return next(new ErrorHandler("The Circle doesn't exist, wrong circle email or name"))
    }
    const isPasswordMatched = await circle.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(circle, 200, res);
})

// Logout as Admin or user
exports.Logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
})

// Register a CircleMember
exports.registerCirlceMember = catchAsyncErrors(async (req, res, next) => {
    const { circleemail, circlename } = req.body;
    const circle = await TransportCircle.findOne({ circleemail, circlename })
    // console.log(circle);
    if (!circle) {
        return next(new ErrorHandler("the given circle doesn't exist , wromg circle name or email", 401));
    }
    const user = new TransportCircleMembers(
        req.body
    );
    // console.log(req.circle._id);
    user.circle = req.circle._id
    await user.save();
    circle.members.push(user)
    await circle.save();
    sendToken(user, 201, res);
});

// Login as user
exports.Login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    // checking if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }
    const user = await TransportCircleMembers.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
})

// to request for transport order of final orders
exports.transportRequest = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.user);
    const orders = req.body.orders
    let counter = orders.length
    async function fun() {
        await new Promise(async (resolve, reject) => {
            (orders.forEach(async (element) => {
                // console.log(element);
                const order = await OrderMatchModel.findById(element).populate("sale").populate("order")
                const notificaton = new Notifications()
                notificaton.type = "transport"
                notificaton.transporter = req.user._id
                notificaton.seller = order.sale.sellerId
                notificaton.order = element
                await notificaton.save()
                --counter;
                // condition to resolve the promise i.e if all products are added successfully..
                if (counter == 0)
                    return resolve("success")
            }))
        })
    }
    await fun()
    // console.log("out");
    res.status(200).json({
        message: "Request for transportation is recorded and waiting for seller to confirm it."
    })
})

// acknowledging that order is delivered to all users successfuly
exports.isDeliverd = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id
    const order = await OrderMatchModel.findById(id).populate("order").populate("sale")
    order.isDelivered = true
    const aggregatedOrder = await BuyOrdersAggregationModel.findById(order.order._id)
    aggregatedOrder.isDelivered = true
    await aggregatedOrder.save()
    const users = aggregatedOrder.users
    // console.log(users);
    let counter = users.length
    async function fun() {
        await new Promise(async (resolve, reject) => {
            (users.forEach(async (element) => {
                const order = await BuyOrderModel.findById(element.buyorderid)
                // console.log(order);
                order.isDelivered = true
                await order.save()
                counter--
                if (counter == 0)
                    return resolve("sucess")
            }))
        })
    }
    await fun()
    res.status(200).json({
        message: "Order delivery Status is Suceessfully recorded.",
        order
    })
})