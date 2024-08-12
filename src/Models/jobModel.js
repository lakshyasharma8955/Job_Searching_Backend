 import mongoose from "mongoose";

const jobSchema = new mongoose.Schema
({
    title:
    {
        type:String,
        required:true,
        minLength:3,
        maxLength:50
    },
    description:
    {
        type:String,
        required:true,
        minLength:3,
        maxLength:350
    },
    category:
    {
        type:String,
        required:true
    },
    country:
    {
        type:String,
        required:true
    },
    city:
    {
        type:String,
        required:true
    },
    location:
    {
        type:String,
        required:true,
        minLength:20
    },
    fixedSalary:
    {
        type:Number,
        minLength:4,
        maxLength:9
    },
    salaryForm:
    {
        type:Number,
        minLength:4,
        maxLength:9
    },
    salaryTo:
    {
        type:Number,
        minLength:4,
        maxLength:9
    },
    expired:
    {
        type:Boolean,
        default:false
    },
    jobPostedOn:
    {
        type:Date,
        default:Date.now()
    },
    postedBy:
    {
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    }
})

const jobModel = mongoose.model("tbe_job",jobSchema);
export default jobModel;