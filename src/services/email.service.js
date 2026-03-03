const nodemailer = require("nodemailer");
const ApiError = require("../utils/ApiError.js");

// Create transporter once (singleton)
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false, // true for 465
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Verify connection (optional but recommended)
transporter.verify((error) => {
    if (error) {
        console.error("Email server connection failed:", error);
    } else {
        console.log("Email server is ready");
    }
});

/**
 * Send Email Service
 */
const sendEmail = async ({
    to,
    subject,
    text,
    html,
    attachments = [],
}) => {
    if (!to || !subject) {
        throw new ApiError(400, "Recipient and subject are required");
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            text,
            html,
            attachments,
        });

        return {
            messageId: info.messageId,
            previewURL: nodemailer.getTestMessageUrl(info) || null,
        };
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new ApiError(500, "Failed to send email");
    }
};

module.exports = { sendEmail };