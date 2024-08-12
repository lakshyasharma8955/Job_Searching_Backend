import mongoose from "mongoose";

const applicationSchema =  new mongoose.Schema
({
    name:
    {
        type:String,
        minLength:3,
        maxLength:30,
        required:true 
    },
    email:
    {
        type:String,
        required:true,
    },
    coverLetter:
    {
        type:String,
        required:true
    },
    phone:
    {
        type:Number,
        required:true
    },
    address:
    {
        type:String,
        required:true
    },
    resume:
    {
        type:String,
        required:true
        // public_id:
        // {
        //     type:String,
        //     required:true
        // },
        // url:
        // {
        //     type:String,
        //     required:true
        // },
    },
    applicationId:
    {
        user:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        role:
        {
            type:String,
            enum:["Job Seeker"],
            required:true
        }
    },
    employeeId:
    {
        user:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        role:
        {
            type:String,
            enum:["Employer"],
            required:true
        }
    }
})

const applicationModel = mongoose.model("tbl_applications",applicationSchema);
export default applicationModel;