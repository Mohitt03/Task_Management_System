const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const fs = require('fs')
const app = express();
const errorHandler = require('./middlewares/errorHandler.middleware')

const webhookRoute = require("./modules/payment/payment.route")
app.use("/webhook", webhookRoute);

app.use(express.json())


// app.use((req, res, next) => {
//     if (req.originalUrl === "/api/webhooks/stripe") {
//         next();
//     } else {
//         express.json()(req,res,next)
//     }
// })

app.use(express.urlencoded({ extended: true }))

function logger(req, res, next) {
    // Date.now
    const log = `Date:- ${new Date().toLocaleString()}, Method:- ${req.method}, URL:- ${req.url}\n`
    fs.appendFile('D:/Task_Management_System/log/route.log.txt', log, (err) => {
        if (err) {
            console.log(err);

        }
    })
    next();
}
app.use(logger);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message
    });
});


const AuthRoutes = require("./modules/auth/auth.route")
const CompanyRoutes = require("./modules/company/company.routes")
const UserRoutes = require("./modules/user/user.route")
const PlanRoutes = require("./modules/plan/plan.routes")
const PaymentRoutes = require("./modules/payment/payment.route")
// // const testingRoute = require("./routes/testingRoute")
const projectRoute = require("./modules/project/project.routes")
const taskRoute = require("./modules/task/task.routes")
const historyRoutes = require("./modules/history/history.routes");
const commentRoutes = require("./modules/comment/comment.routes")
const fileRoutes = require("./modules/file/file.route");
const dashBoardRoutes = require("./modules/dashboard/dashboard.routes");
const jwtVerify = require("./middlewares/auth.middleware")
const paymentStatus = require("./middlewares/paymentStatus.middleware")

app.use('/auth', AuthRoutes);
app.use('/company', jwtVerify, paymentStatus(), CompanyRoutes);
app.use('/user', jwtVerify, paymentStatus(), UserRoutes)
app.use('/plan', jwtVerify, paymentStatus(), PlanRoutes)
app.use('/payment', PaymentRoutes)
app.use('/project', jwtVerify, paymentStatus(), projectRoute)
app.use('/api/task', jwtVerify, paymentStatus(), taskRoute)
app.use('/api/history', jwtVerify, paymentStatus(), historyRoutes)
app.use('/api/comment', jwtVerify, paymentStatus(), commentRoutes)
app.use('/api/file', jwtVerify, paymentStatus(), fileRoutes)
app.use('/api/dashBoard', dashBoardRoutes)

//Error Handler
app.use(errorHandler);

module.exports = app;