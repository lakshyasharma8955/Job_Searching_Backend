import nodemailer from "nodemailer";

export const SendNormal = (to = false, variable = []) => {
    return new Promise(async (resolve, reject) => {
        const fromEmail = variable.from_email;
        const fromPassword = variable.from_password;
    
        const subject = variable.subject;
        const message = variable.content;     
        const transporter = nodemailer.createTransport({
          host: process.env.ADMIN_SMTP_HOST,
          port: process.env.ADMIN_SMTP_PORT,
          secure:false,
          auth: {
            user: process.env.ADMIN_SMTP_EMAIL,
            pass: process.env.ADMIN_SMTP_PASSWORD,
          },
        });
    
        try {
          let info = await transporter.sendMail({
              from: `"${fromEmail}" <${fromPassword }>`,
              to: to,
              subject: subject,  
              html: message,
          }); 
          resolve({ code: 200, data: 'Message has been sent' });
        } catch (error) {
          console.error('Error sending email:', error.message);
          resolve({ code: 400, data: error.message})
        }
    });
};




export const sendForgotEmail = async( to = false, btnLink) =>
{
  return new Promise(async(resolve,reject)=>
{
  const fromEmail = process.env.ADMIN_SMTP_EMAIL;
  const fromPassword  = process.env.ADMIN_SMTP_PASSWORD

  const transporter = nodemailer.createTransport({
    host: process.env.ADMIN_SMTP_HOST,
    port: process.env.ADMIN_SMTP_PORT,
    secure:false,
    auth: {
      user: process.env.ADMIN_SMTP_EMAIL,
      pass: process.env.ADMIN_SMTP_PASSWORD,
    },
  });
  try {
    let info = await transporter.sendMail({
        from: `"${fromEmail}" <${fromPassword }>`,
        to: to,
        subject: "Reset Your Password",  
        html:btnLink,
    }); 
    resolve({ code: 200, data: 'Message has been sent' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    resolve({ code: 400, data: error.message})
  }   
})
}