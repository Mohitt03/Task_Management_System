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
const fileRoutes = require("./modules/file/file.route")


app.use('/auth', AuthRoutes);
app.use('/company', CompanyRoutes);
app.use('/user', UserRoutes)
app.use('/plan', PlanRoutes)
app.use('/payment', PaymentRoutes)
app.use('/project', projectRoute)
app.use('/api/task', taskRoute)
app.use('/api/history', historyRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/file', fileRoutes)

// app.use('/testing', paymentStatus)
// app.get('/testing', (req, res) => {

// })
// app.use('/api/orders', OrderRoutes);
// app.use('/api/products', ProductRoutes);
// app.use('/api/batch', BatchRoutes);

//Error Handler
app.use(errorHandler);

module.exports = app;