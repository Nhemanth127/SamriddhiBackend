const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");

const errorMiddleware = require("./middleware/error");


const dotenv = require("dotenv")
dotenv.config({ path: "backend/config/config.env" });

// Config
// if (process.env.NODE_ENV !== "PRODUCTION") {
//   require("dotenv").config({ path: "backend/config/config.env" });
// }

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Route Imports

const BuyingCircle = require("./routes/BuyingCirlceRoute");
const SellingCircle = require("./routes/SellingCircleRoute");
const TransportCircle = require("./routes/TransportCircleRoute")

app.use("/api/buyer", BuyingCircle);
app.use("/api/seller", SellingCircle);
app.use("/api/transport", TransportCircle)

app.get("/", (req, res) => {
    res.send("Welcome to Samriddhi Backend App...)")
})

app.get("/data", (req, res) => {
    let paath = process.cwd()
    paath = path.join(paath, "frontend", "static", "data.html")
    // console.log(paath);
    res.sendFile(paath)
    // console.log(path);
})



// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// });

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
