const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const fs = require('fs')
const app = express();
const errorHandler = require('./middlewares/errorHandler.middleware')



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
// const CompanyRoutes = require("./routes/company.routes")
// const UserRoutes = require("./routes/user.route")
// const PlanRoutes = require("./routes/plan.routes")
// const PaymentRoutes = require("./routes/payment.route")
// // const testingRoute = require("./routes/testingRoute")
// const projectRoute = require("./routes/project.routes")
// const taskRoute = require("./routes/task.routes")
// const historyRoutes = require("./routes/history.routes");
// const commentRoutes = require("./routes/comment.routes")
// const ProductRoutes = require("./routes/products.route")
// const OrderRoutes = require("./routes/order.route")
// const BatchRoutes = require("./routes/batch.route")
// const paymentStatus = require('./middlewares/paymentStatus.middleware')
// const webhookRoute = require("./routes/payment.route")
// app.use("/webhook", webhookRoute);



app.use('/auth', AuthRoutes);
// app.use('/company', CompanyRoutes);
// app.use('/user', UserRoutes)
// app.use('/plan', PlanRoutes)
// // app.use('/payment', testingRoute, PaymentRoutes)
// app.use('/project', projectRoute)
// app.use('/api/task', taskRoute)
// app.use('/api/history', historyRoutes)
// app.use('/api/comment', commentRoutes)


// app.use('/testing', paymentStatus)
// app.get('/testing', (req, res) => {

// })
// app.use('/api/orders', OrderRoutes);
// app.use('/api/products', ProductRoutes);
// app.use('/api/batch', BatchRoutes);

//Error Handler
app.use(errorHandler);

module.exports = app;