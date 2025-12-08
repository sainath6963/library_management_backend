export const catchAsyncErrors =(theFunction)=>{
    return (req, res , next)=>{
        process.resolve(theFunction(req , res , next)).catch(next);
    }
};