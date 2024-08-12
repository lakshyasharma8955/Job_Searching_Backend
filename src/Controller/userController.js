import userModel from "../Models/userModel.js";
import {USER} from "../Utlis/responceCode.js"
import {registerSchema,loginSchema} from "./Validator/validator.js";
import {isEmailValid,randomString,generatePassword,generateToken,generateOtp} from "../Utlis/utli.js";
import Validator from "validatorjs";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import {SendNormal} from "./sendEmail/sendEmail.js";
import {sendForgotEmail} from "./sendEmail/sendEmail.js";
import { fileURLToPath } from 'url';

  async function sendWelcomeMessage(templateVariables)
  {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const emailTemplate = fs.readFileSync(path.join(__dirname, "../views/users-register.handlebars"), "utf-8");
    const template = handlebars.compile(emailTemplate);
    const messageBody = (template(templateVariables))

    let user_to_email = templateVariables?.email

    const emailSend = {
        from_email: process.env.ADMIN_SMTP_EMAIL,  
        from_password: process.env.ADMIN_SMTP_PASSWORD,
        subject: 'Welcome To Job Portal',
        content: messageBody,
      }
      await SendNormal(user_to_email , emailSend);
  }

export const register = async(req,res) =>
{
    const request = req.body;
    try {
        await registerSchema.validateAsync(request);
        let emailaddress = request?.email?.toLowerCase();
        if(!isEmailValid(emailaddress))
        {
            throw new Error("Invalid email address format");
        }
        const user = await userModel.findOne({email:emailaddress},{email: 1, password: 1, password_salt: 1})
        if(!user)
        {
           let password_salt = await randomString();
           let hashPassword = await generatePassword(request?.password,password_salt);
           request.password = hashPassword;
           request.password_salt = password_salt;
           const newUser = await userModel(request);
            const saveUser = await newUser.save();

            
        const templateVariables = {
            name: saveUser?.name,
            email: saveUser?.email,
          };
          sendWelcomeMessage(templateVariables)

            return res.json({
            code:USER.CREATE_SUCCESS.code,
            data:USER.CREATE_SUCCESS.message
           })
        }
        else
        {
           return res.json({
                 code:USER.ALREADY_REGISTERED.code,
                  message:USER.ALREADY_REGISTERED.message 
                });
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}



// Function to send OTP to the user's email address
 async function sendOTPByEmail(email, otp) {
    let transporter = nodemailer.createTransport({
        host: process.env.ADMIN_SMTP_HOST,
        port: process.env.ADMIN_SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.ADMIN_SMTP_EMAIL,
            pass: process.env.ADMIN_SMTP_PASSWORD 
        },
    });
    let mailOptions = {
        from: '"Fred Foo 👻" <lakshya.sharma9928@gmail.com>',
        to:email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`,
    };
    let info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
}



export const login = async(req,res) =>
{
    const request = req.body;
    try {
        const {email,password,role} = request;
        await loginSchema.validateAsync({email,password,role});
        const emailaddress = request?.email?.toLowerCase();
        if(!isEmailValid(emailaddress))
        {
            throw new Error("Invalid email address format");
        }
        const user = await userModel.findOne({email:emailaddress},{email: 1, password: 1, password_salt: 1,role: 1});
        console.log(user);
        if(user)
        {
            if(role !== user.role)
            {
                return res.json({
                    code: 400,
                    message: "User with this role not found!"
                });
            }
            const passwordString = await generatePassword(request?.password,user.password_salt);
            if(passwordString !== user.password)
            {
                throw new Error("Incorrect Password");
            }
             const loginToken = generateToken({id:user?._id.toString(),email:user.email});
             const otp = generateOtp();
             const otpExpiresAt = new Date();
             otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 1); // Set OTP expiration time to 1 minute from now
             sendOTPByEmail(user.email, otp)
             res.cookie('token', loginToken, { httpOnly: true }); 
         await userModel.updateOne({_id:user?._id},{access_token:loginToken, loginPin: otp, loginPinExpiresAt:otpExpiresAt, last_login:new Date().toISOString(),});
         res.json({
            code:USER.LOGIN_SUCCESS,
            data:{access_token:loginToken},
            message:USER.LOGIN_SUCCESS.message
         })  
        }
        else
        { 
            return res.json
            ({
                code:200,
                message:"Email does not exists"
            })
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}


export const logout = async(req,res) =>
{   
     try {
        res.clearCookie("token","",
        {
            httpOnly:true,
            expries:new Date(Date.now())
        });
        res.json({
            status:200,
            message:"Logout Successfull"
        })
     } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
     }
}




export const otpVerification  = async (req, res) => {
    const { email, otp } = req.body;
    const rules = { email: "required", otp: "required" };
    const validation = new Validator(req.body, rules);
    if (!validation.passes()) {
        const errors = validation.errors.all();
        return res.json({ code: 400, errors: errors });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({
                code: 400,
                message: "User not found"
            });
        }  

        const loginPin = user.loginPin
        const loginPinExpiresAt = user.loginPinExpiresAt;
        if (!loginPin || new Date(loginPinExpiresAt) < new Date()) {
            return res.json({
                code: 400,
                message: "OTP has expired"
            });
        }

        if (loginPin !== otp) {
            return res.json({
                code: 400,
                message: "Invalid OTP"
            });
        }
        await userModel.updateOne({ email }, { $unset: { loginPin: 1, loginPinExpiresAt: 1 } });

        return res.json({
            code: 200,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ code: 500, message: "Internal server error" });
    }
};
   
export const resendOtp = async(req,res) =>
{
    const { email } = req.body;
    const rules = { email: "required" };
    const validation = new Validator(req.body, rules);
    if (!validation.passes()) {
        const errors = validation.errors.all();
        return res.json({ code: 400, errors: errors });
    }
   try {
    let user = await userModel.findOne({email});
    if(!user)
    {
        return res.json
        ({
            code:200,
            message:"User not found"
        })
    }
       const otp = generateOtp();
       const otpExpiresAt = new Date();
       otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 1);

       await userModel.updateOne({email},  { loginPin: otp, loginPinExpiresAt: otpExpiresAt });
       sendOTPByEmail(user.email,otp);

       return res.json
       ({
        code:200,
        message:"OTP resent successfully"
       })
   } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ code: 500, message: "Internal server error" });
   }
}


export const getUser = async(req,res) =>
{
    try {
        const user = await userModel.findOne({_id:USER_ID});
        res.json
        ({
            code:200,
            user:user,
            message:"User find Successfully"
        })
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}

let forgotPasswordValidation = 
{
    "email":"required"
}

export const forgotPassword = async(req,res) =>
{
    let request = req.body;
    let rules =  forgotPasswordValidation;
    let validation = new Validator(request,rules);
    if(!validation.passes())
    {
        const errors = validation.errors.all();
        return res.json({ code: 400, errors: errors });
    }
    try {
         let emailaddress = request?.email?.toLowerCase();
         if(!isEmailValid(emailaddress))
         {
              throw new Error("Invalid Email Address");
         }
         let checkUserDetails = await userModel.findOne({email:emailaddress},{email:1,password_salt:1,password:1});
         if(!checkUserDetails)
         {
            throw new Error("Email does not exists");
         }
         let forgotToken = generateToken({id:checkUserDetails._id,email:checkUserDetails?.email,  type: "ForgotPassword"});
         // Store the forgot token in the database
         await userModel.findByIdAndUpdate(checkUserDetails._id, { forgotToken: forgotToken });
         let btnLink =  process.env.FRONTEND_URL + "/reset-password/" + forgotToken;
         let sendEmail = await sendForgotEmail(checkUserDetails?.email,btnLink);
          if(sendEmail)
          {
            return res.json
            ({
                code:200,
                message:"Reset link sent successfully E-maill address"
            })
          }
          else {
            return res.json({
              code: 400,
              message: "Failed to send message. Please contact Support."
            })
          }     

    } catch (error){
        console.error("An error occurred:", error.message);
        return res.json({
          code: 400,
          message: error.message,
        });
    }
}

// let resetPasswordValidation = 
// {
//     "authToken":"required",
//     "password":"required"
// }

// export const resetPassword = async(req,res) =>
// {
//     let request = req.body;
//     let rules = resetPasswordValidation;
//     let validation = new Validator(request,rules);
//     if(!validation.passes())
//     {
//         const errors = validation.errors.all();
//         return res.json({ code: 400, errors: errors });s
//     }
//     try {
//         const { authToken,password} = request;
//         // let user = await verifyJWTToken(authToken);
//          let user = await userModel.findOne({ forgotToken: authToken });
//         console.log(user);
//         if (!user) {
//             res.json({ code: 400, message: "Invalid Url Please again letter !" });
//         }
//         if (user && user.type === "ForgotPassword") {
//             let userdata = await userModel.findById(user?.id, {});
//             if (!userdata) {
//                 res.json({ status: 400, message: "User Not Found" });
//             }
//             const password_salt = await randomString();
//             const hashPassword = await generatePassword(password, password_salt);
//             let result = await userModel.findByIdAndUpdate(user?.id, { password_salt: password_salt, password: hashPassword,forgotToken:"null" });
//             res.json({
//                 status: 200,
//                 message: "Reset Password Successfully"
//             })
//         }
//     } catch (error){
//         console.error("An error occurred:", error.message);
//         return res.json({
//           code: 400,
//           message: error.message,
//         });
//     }
// }           



let resetPasswordValidation = {
    "authToken": "required",
    "password": "required"
}

export const resetPassword = async (req, res) => {
    let request = req.body;
    let rules = resetPasswordValidation;
    let validation = new Validator(request, rules);
    if (!validation.passes()) {
        const errors = validation.errors.all();
        return res.json({ code: 400, errors: errors });
    }
    try {
        const { authToken, password } = request;
        let user = await userModel.findOne({ forgotToken: authToken });
        if (!user) {
            return res.json({ code: 400, message: "Invalid URL. Please try again later!" });
        }
        const hashPassword = await generatePassword(password, user.password_salt);
        let result = await userModel.findByIdAndUpdate(user._id, { password: hashPassword, forgotToken: null });
        return res.json({
            status: 200,
            message: "Reset Password Successfully"
        });
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.json({
            code: 400,
            message: error.message,
        });
    }
}
