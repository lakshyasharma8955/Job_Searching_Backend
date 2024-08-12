import joi from "joi";

export const registerSchema = joi.object
({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    phone: joi.number().required(),
    password: joi.string().required(),
    role: joi.string().valid("Job Seeker", "Employer").required()
})

export const loginSchema = joi.object
({
    email:joi.string().email().required(),
    password:joi.string().required(),
    role:joi.string().required()

})

export const jobPostSchema = joi.object
({
    title:joi.string().required().min(3).max(50),
    description:joi.string().required().min(10).max(350),
    category:joi.string().required(),
    country:joi.string().required(),
    city:joi.string().required(),
    location:joi.string().min(10).required(),
    fixedSalary:joi.number().min(1000).max(999999999),
    salaryForm:joi.number().min(1000).max(999999999),
    salaryTo:joi.number().min(1000).max(999999999),
    // postedBy:joi.string().valid("User").objectId().required()
})

export const updateJobs = joi.object
({
    // id:joi.string().required(),
    title:joi.string().required().min(3).max(50),
    category:joi.string().required(),
    description:joi.string().required().min(10).max(350),
    country:joi.string().required(),
    city:joi.string().required(),
    location:joi.string().required(),
    fixedSalary:joi.number().min(1000).max(999999999),
    salaryForm:joi.number().min(1000).max(999999999),
    salaryTo:joi.number().min(1000).max(999999999),
    expired: joi.boolean().default(false)
})
