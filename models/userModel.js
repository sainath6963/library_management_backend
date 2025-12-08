import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email:{
    type:String,
    required:true,
    lowercase:true,
  },
  password:{
    type:String,
    required:true,
    select:false
  },
  role:{
    type:String,
    enum:["Admin", "User"],
    default:"User",
  },
  accountVerified:{type:Boolean , default:false},
  borrowedBooks:[
    {
        bookId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Borrow"
        },
        returned:{
            type:Boolean,
            default:false,
        },
        bookTitle:string,
        borrowedDate:Date
    }
  ]
});
