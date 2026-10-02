import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default upload;

// memoryStorage() file ko temporary memory buffer mein rakhta hai, disk par save nahi karta.
// fileFilter allowed image MIME types check karta hai.
// limits.fileSize ek file ko maximum 5 MB tak limit karta hai.
// upload configured Multer instance hai, jise routes mein middleware ke roop mein use karenge.
// file.mimetype request se aata hai, isliye ye basic validation hai—production mein file contents bhi verify karna useful hoga.