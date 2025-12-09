import ErrorHandler from "../middlewares/errorMiddlewares";
import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import { sendVerificationCode } from "../utils/sendVerificationCode";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
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
    if(password.length < 8 || password.length > 16){
        return next(new ErrorHandler("password must be between 8 to 16 characters", 400))
    }
    const hashedPassword = await bcrypt.hash(password , 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    })
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(verificationCode , email , res)
  } catch (error) {
    next(error)
  }
});
