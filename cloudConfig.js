const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ghoomify_dev',
        allowedFormats: ["png", "jpg", "jpeg"],
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit to 5MB
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only .jpg, .jpeg, and .png files are allowed!"));
    },
});

module.exports = {
    cloudinary,
    storage,
    upload
};