export function generateVerificationOtpEmailTemlate(otpCode){
   `<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f4f4f7; font-family:Arial, Helvetica, sans-serif;">
    <div style="max-width:500px; margin:30px auto; background:#ffffff; border-radius:8px; padding:35px 28px; box-shadow:0 4px 12px rgba(0,0,0,0.06);">

      <h2 style="margin:0; text-align:center; color:#2563eb; font-size:26px;">
        
      </h2>

      <h3 style="text-align:center; color:#111827; margin-top:25px; font-size:22px;">
        Verify Your Email Address
      </h3>

      <p style="text-align:center; color:#6b7280; margin:10px 0 25px; font-size:15px;">
        Enter the OTP code below to complete your email verification.
      </p>

      <div style="text-align:center; margin:28px 0;">
        <div style="display:inline-block; font-size:32px; font-weight:700; letter-spacing:10px; padding:18px 28px;
        border-radius:10px; background:#e8f2ff; color:#0f172a; border:1px solid #bcd7ff;">
          ${otpCode}
        </div>
      </div>

      <p style="font-size:14px; color:#374151; line-height:1.7; margin:0;">
        This OTP is <strong>valid for 10 minutes</strong>. Do not share this code with anyone — even if someone claims to be from ${appName}.
      </p>

      <p style="font-size:12px; color:#dc2626; margin-top:10px;">
        ⚠ Our support team will never ask for your OTP.
      </p>

      <p style="text-align:center; margin-top:30px;">
        <a href="#" style="background:#2563eb; text-decoration:none; color:#ffffff; padding:12px 24px; border-radius:6px; font-size:14px;">
          Open 
        </a>
      </p>

      <p style="text-align:center; font-size:12px; color:#9ca3af; margin-top:35px;">
        &copy; . All rights reserved.
      </p>

    </div>
  </body>
</html>`
}