const nodemailer = require("nodemailer");
const asyncHandler = require("./asyncHandler");

const sendEmail = async ({ to, subject, html }) => {

    const transporter = nodemailer.createTransport({
        service: "gmail", // or use SMTP config
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    });


    await transporter.sendMail({
        from: `"StoreFront Inventory" <${process.env.EMAIL}>`,
        to,
        subject,
        html
    });

    console.log("Email sent to:", to);


};


module.exports = sendEmail