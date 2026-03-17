const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

const sendEmail = async ({ to, subject, text, html }) => {
    const info = await transporter.sendMail({
        from: `"System" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
        html
    });

    console.log("Email sent to:", to);
    return info;
};

module.exports = sendEmail;