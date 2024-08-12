import mongoose from "mongoose";

export const dbConnection = async() =>
{
   await mongoose.connect(process.env.DB,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(()=>
        {
            console.log("Database Connection Successfully");
        }).catch((error)=>
        {
            console.log("Database Not Connected",error);
        })
}