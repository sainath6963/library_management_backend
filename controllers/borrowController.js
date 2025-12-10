import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrowModel.js";
import { BooK } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { calculateFine } from "../utils/fineCalculator.js";

export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body || {};

  const book = await BooK.findById(id);
  if (!book) return next(new ErrorHandler("Book not found", 404));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (book.quantity === 0) {
    return next(new ErrorHandler("Book not available", 400));
  }

  const alreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && !b.returned
  );

  if (alreadyBorrowed) {
    return next(new ErrorHandler("Book already borrowed", 400));
  }

  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate,
  });

  await user.save();

  await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: {
      id: book._id,
      price: book.price,
    },
    borrowDate: new Date(),
    dueDate,
    fine: 0,
    notified: false,
  });

  return res.status(200).json({
    success: true,
    message: "Borrowed book recorded successfully.",
  });
});

export const returnBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.params;
  const { email } = req.body || {};

  const book = await BooK.findById(bookId);
  if (!book) return next(new ErrorHandler("Book not found", 404));

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) return next(new ErrorHandler("User not found", 404));

  const borrowedBook = user.borrowedBooks.find(
    (b) => b.bookId.toString() === bookId && !b.returned
  );

  if (!borrowedBook) {
    return next(new ErrorHandler("You have not borrowed this book", 400));
  }

  borrowedBook.returned = true;
  borrowedBook.returnDate = new Date();
  await user.save();

  book.quantity = Math.max(0, book.quantity + 1);
  book.availability = book.quantity > 0;
  await book.save();

  const borrow = await Borrow.findOne({
    "book.id": bookId,
    "user.email": email,
    returnDate: null,
  });

  if (!borrow) {
    return next(new ErrorHandler("No matching borrowing record found", 400));
  }

  borrow.returnDate = new Date();

  const fine = calculateFine(borrow.dueDate);
  borrow.fine = fine;

  await borrow.save();

  const totalCharge = book.price + fine;

  return res.status(200).json({
    success: true,
    message:
      fine > 0
        ? `Book returned successfully. Total charge including fine: ₹${totalCharge}`
        : `Book returned successfully. Total charge: ₹${book.price}`,
  });
});

export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const { borrowedBooks } = req.user;

  res.status(200).json({
    success: true,
    borrowedBooks,
  });
});


export const getBorrowedBookAdmin = catchAsyncErrors(async (req, res, next) => {
  const borrowedBooks = await Borrow.find();

  res.status(200).json({
    success: true,
    borrowedBooks,
  });
});

