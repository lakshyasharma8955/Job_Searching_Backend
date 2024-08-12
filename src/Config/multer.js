import multer from "multer";
import path from "path";

const storage = multer.diskStorage
({
    destination: (req,file,cb) =>
    {
        cb(null,"public/uploads/")
    },
    filename: (req,file,cb) =>
    {
        const ext = path.extname(file.originalname);
        cb(null,`${Date.now()}${ext}`)
    }
})

// Set up multer middleware

const upload = multer({storage});
export default upload;  