const nodemailer = require("nodemailer");
const asyncHandler = require("./asyncHandler");

const sendEmail = asyncHandler(async ({ to, subject, html }) => {

    const transporter = nodemailer.createTransport({
        service: "gmail", // or use SMTP config
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });


    await transporter.sendMail({
        from: `"StoreFront Inventory" <${process.env.EMAIL}>`,
        to,
        subject,
        html
    });

    console.log("Email sent to:", to);


});


module.exports = sendEmail