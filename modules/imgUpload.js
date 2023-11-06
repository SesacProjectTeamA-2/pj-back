const express = require('express');
const app = express();

const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

// 이미지 업로드 처리
app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file);
  const imageUrl = req.file.location; // 업로드된 이미지의 S3 URL
  res.render('index', { imageUrl });
});
