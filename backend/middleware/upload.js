
import multer from "multer";

const storage = multer.memoryStorage();

const allowedTypes = [
  // Proposal documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",

  // Project images
  "image/jpeg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only PDF, DOC, DOCX, TXT, JPG, PNG, and WEBP files are allowed."
      )
    );
  },
});

export default upload;
