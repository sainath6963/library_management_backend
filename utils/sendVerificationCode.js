import { generateVerificationOtpEmailTemlate } from "./emailTemplates.js";

export async function sendVerificationCode(verificationCode , email ,res){
    try {
        const message = generateVerificationOtpEmailTemlate(verificationCode);
        sendEmail({
            email,
            subject:"verification code (Bookwrom Library Management System)",
            message
        })
        res.status(200).json({
            success:true,
            message:"verification code sent successfully."
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"verification code failed to send."
        })
    }
}