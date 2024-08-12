import mongoose from "mongoose";

const userSchema = new mongoose.Schema
({
    name: {type:String,required:true,minLength:3,maxLength:30},
    email: {type:String,required:true},
    phone: {type:Number,required:true},
    password: { type: String, required: true,},
    password_salt:{type:String,required:true},
    access_token:{type:String,required:false},
    forgotToken:{type:String,required:false},
    loginPin:{type:String,required:false},
    loginPinExpiresAt:{type:Date,required:false},
    last_login:{type:Date,required:false},
    role: {type:String,required:true,enum:["Job Seeker", "Employer"]}
},{timestamps:true})

const userModel = mongoose.model("tbl_users",userSchema);
export default userModel;