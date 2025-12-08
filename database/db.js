import mongoose from "mongoose";

export const connectDB = async () => {
    mongoose.connect(process.env.MONGODB_URL, {
        dbName:"LIBRARY_MANAGEMENT"
    }).then(()=>{
        console.log("Database connected ");
        
    }).catch((err)=>{
        console.log("Error connecting to Database" , err);
        
    })
}  