require("dotenv").config();

const { sendEmail } = require("./src/services/email.service");

// (async () => {
//   try {
//     const result = await sendEmail({
//       to: "mohitnagpure56@gmail.com",
//       subject: "Test Email 🚀",
//       text: "This is a direct test email.",
//       html: "<h1>This is a direct test email.</h1>",
//     });

//     console.log("Email sent successfully!");
//     console.log("Message ID:", result.messageId);
//   } catch (error) {
//     console.error("Error sending email:", error.message);
//   }
// })();