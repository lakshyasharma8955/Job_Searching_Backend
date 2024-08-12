import jobModel from "../Models/jobModel.js";
import {jobPostSchema,updateJobs} from "./Validator/validator.js";
import userModel from "../Models/userModel.js";
import xlsx from "xlsx";
import XLSX from "xlsx";
import _ from "underscore";

export const getAllJobs = async(req,res) =>
{
    try {
        const job = await jobModel.find({expired:false});
     return res.json
    ({
        code:200,
        jobs:job,
        message:"All jobs find successfully"
    })
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}

export const postjobs = async(req,res) =>
{
    const request = req.body;
    try {
        await jobPostSchema.validateAsync(request);
        const user = await userModel.findById({_id:USER_ID},{role:1});
        if(user.role === "Job Seeker")
         {
           return res.json
            ({
                code:400,
                message:"Job Seeker not allowed to access this resource."
            })
         }
         const {
            title,
            description,
            category,
            country,
            city,
            location,
            fixedSalary,
            salaryForm,
            salaryTo
        }  = request;
        if(!title || !description || !category || !country || !city || !location)
        {
             return res.json
              ({
                code:400,
                message:"Please provide full job details."
              })
        } 
        if((!salaryForm || !salaryTo) && ! fixedSalary)
        {
            return res.json
            ({
                code:400,
                message:"Please either provide fixed salary or ranged salary."
            })
        }
        if(salaryForm && salaryTo && fixedSalary)
        {
            return res.json
            ({
                code:400,
                message:"Cannot Enter Fixed and Ranged Salary together."
            })
        }
        const postedBy = USER_ID;
        const job = await jobModel.create
        ({
            title,
            description,
            category,
            country,
            city,
            location,
            fixedSalary,
            salaryForm,
            salaryTo,
            postedBy  
        })
        res.json
        ({
            code:200,
            job:job,
            message:"Job Posted Successfully!"
        })

    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}


export const getMyJobs = async(req,res) =>
{
    try {
        const user = await userModel.findById({_id:USER_ID},{role:1});
        if(user.role === "Job Seeker")
        {
            res.json
            ({
                code:400,
                message:"Job Seeker not allowed to access this resource."
            })
        }
        const myJobs = await jobModel.find({postedBy:USER_ID});
        res.json
        ({
            code:200,
            job:myJobs,
            message:"Job find successfully"
        })
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}



export const updateJob = async(req,res) =>
{
    const request = req.body;
   try {
    await updateJobs.validateAsync(request);
    const user = await userModel.findById({_id:USER_ID},{role:1});
    if(user.role === "Job Seeker")
    {
       return res.json
        ({
            code:400,
            message:"Job Seeker not allowed to access this resource."
        })
    }
    const {id} = req.params;
    const job = await  jobModel.findById(id);
    if(!job)
    {
         throw new Error("Oops jobs not found!");
    }
    const result = await jobModel.findByIdAndUpdate(id,request);
    res.json
    ({
        code:200,
        job:result,
        message:"Jobs update successfully"
    })
   } catch (error) {
    console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
   }
}


export const deleteJobs = async(req,res) =>
{
    try {
        const user = await userModel.findById({_id:USER_ID},{role:1});
    if(user.role === "Job Seeker")
    {
        res.json
        ({
            code:400,
            message:"Job Seeker not allowed to access this resource."
        })
    }
    const {id} = req.params;
    const job = await jobModel.findById(id);
    if(!job)
    {
        throw new Error("Oops jobs not found!");
    }
    const deletejob = await jobModel.deleteOne();
    res.json
    ({
        code:400,
        job:deletejob,
        message:"Delete jobs successfully"
    })
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}



export const getSingleJob = async(req,res) =>
{
    console.log(req.params)
    const jobId = req.params.id;
    try {
        const job = await jobModel.findById(jobId);
        if(!job)
        {
            return res.json({
                code: 404,
                message: 'Job not found',
            });
        }
        res.json({
            code: 200,
            jobs: job,
            message: 'Job found successfully',
        });
    } catch (error) {
        console.error('An error occurred:', error.message);
        return res.json({
            code: 500,
            message: 'Invaild Job Id format',
        }); 
    }
}



export const generateExcelFile = async(req,res) =>
    {
        try {
            const user = await userModel.findById({_id:USER_ID},{role:1})
            if(user?.role === "Job Seeker")
              {
                res.json
                ({
                    code:400,
                    message:"Job Seeker not allowed to access this resource."
                })
              }
              const appId = await jobModel.find({postedBy:user?.id},{title:1, description:1, category:1, country:1, city:1, location:1, salaryForm:1,salaryTo:1,fixedSalary:1});
              let workbook = xlsx.utils.book_new();
              if(appId?.length)
                {
                    let sheetRow = 2;
                    let replenishWorkSheet = xlsx.utils.aoa_to_sheet([], { cellStyles: true });
                    xlsx.utils.book_append_sheet(workbook, replenishWorkSheet);
                    let table_columns = ["Title", "Description", "Category", "Country", "City", "Location", "SalaryForm","SalaryTo","FixedSalary"];
                    xlsx.utils.sheet_add_aoa(replenishWorkSheet, [table_columns], { origin: 'A1' });
                    for(let element of appId)
                        {
                             let xlsxSetdata = 
                             {
                                'Title': element?.title,
                                'Description': element?.description,
                                'Category': element?.category,
                                'Country': element?.country,
                                'City': element?.city,
                                'Location': element?.location,
                                'SalaryForm': element?.salaryForm,
                                'SalaryTo':element?.salaryTo,
                                'FixedSalary': element?.fixedSalary
                             }
                             xlsx.utils.sheet_add_aoa(replenishWorkSheet, [Object.values(xlsxSetdata)], { origin: `A${sheetRow}` });
                             sheetRow++;

                             console.log(xlsxSetdata)
                        }
              // Auto-fit column widths
            let totalSheetrange = xlsx.utils.decode_range(replenishWorkSheet['!ref']);
            let col_length = [];
            for (let R1 = totalSheetrange.s.r; R1 <= totalSheetrange.e.r; ++R1) {
                for (let C1 = totalSheetrange.s.c; C1 <= totalSheetrange.e.c; ++C1) {
                    col_length.push({ wch: 21 });
                }
            }
            replenishWorkSheet['!cols'] = col_length;

             // Write the workbook to a file
             let fileName = `public/employee/employeeJobList`;
             xlsx.writeFile(workbook, `${fileName}.xlsx`);
                // Response
            let filexlsx = `${fileName}.xlsx`;
            if (filexlsx) {
                return res.json({ code: 200, message: "Successfully exported employee list xlsx sheet" });
            } else {
                return res.status(400).json({ code: 400, message: "Failed to export employee list xlsx sheet" });
            }
        } else {
            return res.status(404).json({ code: 404, message: "No user data found" });
        }
        } catch (error) {
            console.error('An error occurred:', error.message);
            return res.json({
                code: 500,
                message: 'Invaild Job Id format',
            }); 
        }
    }