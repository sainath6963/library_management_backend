import { generateVerificationOtpEmailTemlate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationCode(verificationCode, email, res) {
  try {
    const message = generateVerificationOtpEmailTemlate(verificationCode);
    console.log("EMAIL HTML =>", message); 
    await sendEmail({
      email,
      subject: "verification code (Bookworm Library Management System)",
      message,
    });

    res.status(200).json({
      success: true,
      message: "verification code sent successfully.",
    });
  } catch (error) {
     console.log("EMAIL ERROR =>", error.message);
  return res.status(500).json({
    success: false,
    message: "verification code failed to send."
    });
  }
}
