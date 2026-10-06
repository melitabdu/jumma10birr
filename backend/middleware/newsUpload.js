import multer from "multer";

const storage = multer.memoryStorage();

const newsUpload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",

      // Videos
      "video/mp4",
      "video/mov",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG, WebP images and MP4, MOV, AVI videos are allowed."
        )
      );
    }
  },
});

export default newsUpload;