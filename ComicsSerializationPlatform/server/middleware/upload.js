const multer = require('multer');
const path = require('path');

function createUploadStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `${timestamp}${ext}`);
    }
  });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('只支持图片格式文件'));
};

const upload = {
  cover: multer({
    storage: createUploadStorage('covers'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  }),
  avatar: multer({
    storage: createUploadStorage('avatars'),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  }),
  chapter: multer({
    storage: createUploadStorage('chapters'),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  })
};

module.exports = upload;
