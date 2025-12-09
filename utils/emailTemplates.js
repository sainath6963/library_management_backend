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
