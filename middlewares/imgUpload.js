const multer = require('multer');

const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../config/.env' });

// aws-sdk와 multer-s3 모듈의 버전이 맞아야 함
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

// AWS S3 설정
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer-S3 미들웨어 설정
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

module.exports = { upload };
