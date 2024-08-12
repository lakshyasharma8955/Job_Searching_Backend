import {verifyJWTToken} from "../Utlis/utli.js";

export const destorySession = async(userId) =>
{
    delete userSession[userId];
    return true
}

export const verifyToken = async(req,res,next) =>
{
    let request = req.body;
    let Authorization = req.headers["authorization"];
    if(!Authorization)
    {
        return res.json
        ({
            code:403,
            message:"Please Provide Token in a header"
        })
    }
    let data = await verifyJWTToken(Authorization);
    if(data)
    {
        global.USER_ID = data?.id;
        next();
    }
    else
    {
        return res.json
        ({
            code:403,
            message:"Authorization Expried or Forbidden",
            status:false
        })
    }
} 