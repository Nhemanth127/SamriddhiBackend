const Sale = require("../models/SaleModel");
const SellingCircleMembers = require("../models/SellingCircleMembersModel")
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// 1-Creating a sale by admin with seller Reference..
exports.createSale = catchAsyncErrors(async (req, res, next) => {
    const user = await SellingCircleMembers.findOne({ email: req.body.email })
    if (!user) {
        return next(new ErrorHandler("No Seller found with this email-id!"))
    }
    const sale = new Sale()
    sale.circleId = req.circle._id
    sale.circle = req.circle.circlename
    sale.circleemail = req.circle.circleemail
    sale.sellerId = user._id
    sale.seller = user.name
    sale.selleremail = user.email

    const products = req.body.products

    async function fun() {
        let counter = products.length
        await new Promise(async (resolve, reject) => {
            (products.forEach(async (element) => {
                // console.log(element);
                const obj = {
                    name: element.name,
                    category: element.category,
                    price: element.price,
                    quantity: element.quantity,
                    minorder: element.minorder
                }
                // console.log(obj);
                sale.products.push(obj)
                --counter;
                // condition to resolve the promise i.e if all products are added successfully..
                if (counter == 0)
                    return resolve("success")
            }))
        })
    }
    fun().then(async () => {
        await sale.save()
        res.status(201).json({
            success: true,
            sale,
        });
    }).catch((err) => {
        return next(new ErrorHandler(err));
    })
})

// 2-Getting all Current Active Sales..
exports.getSales = catchAsyncErrors(async (req, res, next) => {
    const sales = await Sale.find()
    res.status(200).json({
        success: true,
        sales
    })
})