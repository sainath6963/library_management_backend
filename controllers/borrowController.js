import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrowModel.js";

export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {});
export const recordBorrowedBook = catchAsyncErrors(
  async (req, res, next) => {}
);
export const getBorrowedBookAdmin = catchAsyncErrors(
  async (req, res, next) => {}
);
export const returnBorrowedBook = catchAsyncErrors(
  async (req, res, next) => {}
);
