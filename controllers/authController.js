import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  console.log("BODY =>", req.body);
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return next(new ErrorHandler("please enter all fields.", 400));
    }

    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return next(new ErrorHandler("User already exists", 400));
    }
    const registerationAttemptsByuser = await User.find({
      email,
      accountVerified: false,
    });
    if (registerationAttemptsByuser.length >= 5) {
      return next(
        new ErrorHandler(
          "you have exceeded the number of registration attemps. please contact support",
          400
        )
      );
    }
    if (password.length < 8 || password.length > 16) {
      return next(
        new ErrorHandler("password must be between 8 to 16 characters", 400)
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(verificationCode, email, res);
  } catch (error) {
    next(error);
  }
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return next(new ErrorHandler("Email or OTP missing", 400));
  }
  console.log("EMAIL FROM BODY =>", email);
  console.log("OTP FROM BODY =>", otp);
  const userAllentries = await User.find({
    email,
    accountVerified: false,
  }).sort({ createdAt: -1 });

  if (userAllentries.length === 0) {
    return next(new ErrorHandler("User not found", 404));
  }

  let user;
  if (userAllentries.length > 1) {
    user = userAllentries[0];
    await User.deleteMany({
      _id: { $ne: user._id },
      email,
      accountVerified: false,
    });
  } else {
    user = userAllentries[0];
  }

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  const currentTime = Date.now();
  const verificationCodeExpire = new Date(
    user.verificationCodeExpire
  ).getTime();

  if (currentTime > verificationCodeExpire) {
    return next(new ErrorHandler("OTP expired", 400));
  }

  user.accountVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpire = null;
  await user.save({ validateModifiedOnly: true });

  sendToken(user, 200, "Account Verified", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  console.log("===== LOGIN API HIT =====");
  console.log("Request Body:", req.body);
  console.log("Headers:", req.headers);
  console.log("Query Params:", req.query);
  console.log("Cookies:", req.cookies);
  console.log("==========================");

  const { email, password } = req.body || {};
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const ispasswordMatched = await bcrypt.compare(password, user.password);
  if (!ispasswordMatched) {
    return next(new ErrorHandler("Invalid Email or  Password", 400));
  }
  sendToken(user, 200, "User login successfully", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged Out successfully.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user || {};
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler("Email is required ", 400));
  }
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("user not found", 400));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "BOOK Library Management System Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// export const resetPassword = catchAsyncErrors(async (req, res, next) => {
//   const { token } = req.params;

//   const resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(token)
//     .digest("hex");

//   const user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });

//   if (user) {
//     console.log("Token expires at:", user.resetPasswordExpire);
//   }

//   if (!user) {
//     return next(
//       new ErrorHandler("Reset password token is invalid or has expired", 400)
//     );
//   }

//   const { password, confirmPassword } = req.body;

//   if (!password || !confirmPassword) {
//     return next(
//       new ErrorHandler("Please enter password & confirm password", 400)
//     );
//   }

//   if (password !== confirmPassword) {
//     return next(
//       new ErrorHandler("Password & confirm Password do not match", 400)
//     );
//   }

//   if (password.length < 8 || password.length > 16) {
//     return next(
//       new ErrorHandler("Password must be between 8 to 16 characters", 400)
//     );
//   }

//   user.password = await bcrypt.hash(password, 10);
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;

//   await user.save();

//   sendToken(user, 200, "Password reset successfully", res);
// });

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (user) {
    console.log("Stored DB Token:", user.resetPasswordToken);
    console.log("Expires At:", user.resetPasswordExpire);
    console.log("Current Time:", new Date(Date.now()));
  }

  if (!user) {
    return next(
      new ErrorHandler("Reset password token is invalid or has expired", 400)
    );
  }

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(
      new ErrorHandler("Please enter password & confirm password", 400)
    );
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password & confirm Password do not match", 400)
    );
  }

  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 to 16 characters", 400)
    );
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, "Password reset successfully", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("All fields are Required", 400));
  }
  const ispasswordMatched = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!ispasswordMatched) {
    return next(
      new ErrorHandler("currentPassword password is incorrect.", 400)
    );
  }
  if (newPassword.length < 8 || newPassword.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 to 16 characters", 400)
    );
  }
  if (newPassword !== confirmPassword) {
    new ErrorHandler(
      "New Password and confirm new password do not match ",
      400
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "password updated.",
  });
});
