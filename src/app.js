import Express from "express"
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {dbConnection} from "./Config/db.js";
import userRouter from "./Routes/userRoutes.js";
import jobRouter from "./Routes/jobsRoutes.js";
import applicationRouter from "./Routes/applicationRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";



const app = Express();

cloudinary.config({   
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_CLIENT_API,
    api_secret:process.env.CLOUDINARY_SECRET  
})

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","POST","DELETE","PUT"],
    credentials:true
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// app.use(Express.json());
// app.use(Express.urlencoded({extended:true}))
app.use(cookieParser());
dbConnection();

// Deployment code get website path

app.get("/health", async(req,res) =>{
    res.send({message : "Health Successfully!"})
})


// app.use(express.static())

app.use("/api/v1/user",userRouter);
app.use("/api/v1/job",jobRouter);
app.use("/api/v1/application",applicationRouter);

   
app.use(fileUpload
    ({
        useTempFiles:true,
        tempFileDir:"/tmp"
    }))

    app.listen(process.env.PORT,()=>
    {
        console.log(`Listing the port number on ${process.env.PORT}`)
    })