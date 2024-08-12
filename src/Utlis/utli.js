import { rejects } from "assert";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
export function isEmailValid(email)
{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function randomString()
{
  return new Promise(async(reslove,rejects)=>
  {
    let length = 60;
    let result = '';
    let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let characterLength = character.length;
    for(let i=0;i<length;i++)
    {
        result += character.charAt(Math.floor(Math.random() * characterLength ));
    }
    reslove(result);
  })
}

export function generatePassword(password, password_salt)
{
    return new Promise(async(reslove,rejects)=>
    {
        let hash = crypto.pbkdf2Sync(password,password_salt,1000,64,"sha512").toString("base64");
        reslove(hash);
    })
}

export function generateToken(userId)
{
    console.log(process.env?.JWT_SECRET_KEY,"generateToken JWT_SECRET_KEY")
    return jwt.sign(userId,process.env?.JWT_SECRET_KEY,{expiresIn:"1h"});
}


export function verifyJWTToken(Authorization)
{
    return new Promise(async(reslove,rejects)=>
    {
        jwt.verify(Authorization,process.env.JWT_SECRET_KEY,async(err,data)=>
        {
            if(err)
            {
                console.log('Authorization Expried or Forbidden');
                reslove(false);
            }
            else
            {
                reslove(data);
            }
        })
    })
} 


//  generate Otp Function 

export function generateOtp()
{
    let length = 6;
    const digits = '0123456789';
    let otp = '';
    for(let i=0;i<length;i++)
    {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }
    return otp;
}



// // Function to send OTP to the user's email address
// export async function sendOTPByEmail(email, otp) {
//     let transporter = nodemailer.createTransport({
//         host: process.env.ADMIN_SMTP_HOST,
//         port: process.env.ADMIN_SMTP_PORT,
//         secure: false,
//         auth: {
//             user: process.env.ADMIN_SMTP_EMAIL,
//             pass: process.env.ADMIN_SMTP_PASSWORD 
//         },
//     });
//     let mailOptions = {
//         from: '"Fred Foo 👻" <lakshyasharma.hawkscode@gmail.com>',
//         to:to,
//         subject: 'OTP Verification',
//         text: `Your OTP is: ${otp}`,
//     };
//     let info = await transporter.sendMail(mailOptions);

//     console.log('Message sent: %s', info.messageId);
// }

