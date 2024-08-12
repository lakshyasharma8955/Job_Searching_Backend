import applicationModel from "../Models/applicationModel.js";
import userModel from "../Models/userModel.js";
import jobModel from "../Models/jobModel.js";


export const employeeGetAllApplication = async (req, res) => {
  try {
    const user = await userModel.findById({
      _id: USER_ID
    }, { 
      role: 1
    });
    if (user.role === "Job Seeker") {
      return res.json({
        code: 400,
        message: "Job Seeker not allowed to access this resource."
      })
    }
    const employee = await applicationModel.find({
      "employeeId.user": USER_ID
    });
    return res.json({
      code: 200,
      job: employee,
      message: "Employee application find successfully"
    })

  } catch (error) {
    console.error("An error occurred:", error.message);
    return res.json({ 
      code: 400,
      message: error.message,
    });
  }
}


export const jobSeekerGetAllApplication = async (req, res) => {
  try {
    const user = await userModel.findById({
      _id: USER_ID
    }, {
      role: 1
    });
    if (user.role === "Employer") {
      return res.json({
        code: 400,
        message: "Employee not allowed to access this resource."
      })
    }
    const jobSeeker = await applicationModel.find({
      "applicationId.user": USER_ID
    });
    res.json({
      code: 200,
      job: jobSeeker,
      message: "Job seeker application find successfully"
    })
  } catch (error) {
    console.error("An error occurred:", error.message);
    return res.json({
      code: 400,
      message: error.message,
    });
  }
}


export const jobSeekerDeleteApplication = async (req, res) => {
  const request = req.body;
  try {
    const user = await userModel.findById({
      _id: USER_ID
    }, {
      role: 1
    });
    if (user.role === "Employer") {
      res.json({
        code: 400,
        message: "Employee not allowed to access this resource."
      })
    }
    const {id} = req.params;
    const job = await applicationModel.findById(id);
    if (!job) {
      throw new Error("Application not found!");
    }
    const deletejob = await applicationModel.deleteOne();
    console.log(deletejob,"delete Job")
    res.json({
      code: 200,
      job: deletejob,
      message: "Job seeker application delete successfully"
    })
  } catch (error) {
    
    console.error("An error occurred:", error.message);
    return res.json({
      code: 400,
      message: error.message,
    });
  }
}


export const postApplication = async(req,res) =>
{
  try {
    const user = await userModel.findById({_id:USER_ID}, { role: 1 });
    if (user.role === "Employer") {   
      return res.json({     
        code: 400,
        message: "Employer not allowed to access this resource."
      });
    }
    console.log(req.body,"request");
    console.log(req.file,"req.file");
  
    if (!req.file) {
      return res.json({
        code: 400, 
        message: "Resume File Required!" 
      });
    }
    const resume = req.file;
    console.log(resume)
    const currentDomain = process.env.DOMAIN ? process.env.DOMAIN : req.hostname;
    const currentPath = `${currentDomain}/upload/${req.file.filename}`;

    const {  name, email,coverLetter, phone, address, jobId} = req.body;
    const applicationId = {
      user: USER_ID,
      role: "Job Seeker",
    };
      
    if(!jobId)
    { 
      return res.json
      ({
        code:404,
        message:"Job Not Found"
      })
    }
    
    const jobDetails = await jobModel.findById(jobId);
    if (!jobDetails) {
      return res.json({
        code: 404, 
        message: "Job not found!"
      });
    }

    const employeeId = {
      user: jobDetails.postedBy,
      role: "Employer",
    };

    if (
      !name ||
      !email ||
      !coverLetter ||
      !phone ||
      !address ||
      !applicationId ||
      !employeeId  ||
      !resume
    ) {   
      return res.json
      ({
        code:400,
        message:"Please all fields required"
      })
    }
    const application = await applicationModel.create({
      name,
      email,
      coverLetter,
      phone,
      address,
      applicationId,
      employeeId,
     resume:currentPath
    });
    return res.json({
      code: 200,
      job: application,
      message: "Application Submitted!",
    });
  } catch (error) {
    console.error("An error occurred:", error.message);
    return res.status(400).json({
      code: 400,
      message: error.message,
    });
  }
}


