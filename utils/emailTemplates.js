export const generateVerificationOtpEmailTemlate = (verificationCode, appName = "Bookworm Library Management System") => {
  return `
    <div style="font-family:Arial; padding:20px;">
      <h2 style="color:#3759f5;">${appName}</h2>
      <p>Use the OTP below to verify your account.</p>
      <h1 style="font-size:32px; margin:20px 0;">${verificationCode}</h1>
      <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
};


export const generateForgotPasswordEmailTemplate = (
  resetPasswordUrl,
  appName = "BOOK Library Management System"
) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #e6e6e6; padding: 25px; border-radius: 8px; background: #fafafa;">
    
    <h2 style="color: #3759f5; text-align: center; margin-bottom: 10px;">
      ${appName}
    </h2>
    
    <p style="font-size: 15px; color: #444;">
      You recently requested to reset your password. Click the button below to reset it.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetPasswordUrl}"
        style="background: #3759f5; color: #fff; padding: 14px 22px; border-radius: 6px; font-size: 16px; text-decoration: none;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #444;">
      If the button doesn't work, copy and paste the following link into your browser:
    </p>

    <p style="font-size: 14px; word-break: break-all; color: #3759f5;">
      ${resetPasswordUrl}
    </p>

    <p style="font-size: 13px; color: #777; margin-top: 28px;">
      This link is valid for <strong>15 minutes</strong>. If you didn’t request a password reset, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 24px 0;" />

    <p style="font-size: 13px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} ${appName}. All Rights Reserved.
    </p>

  </div>
  `;
};
