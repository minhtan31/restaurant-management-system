const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Cấu hình storage - lưu file vào disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Tên file: timestamp-originalname (loại bỏ ký tự đặc biệt)
    const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`
    cb(null, uniqueName)
  },
})

// Filter: chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'), false)
  }
}

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// Middleware upload single image (field name: "image")
const uploadImage = (req, res, next) => {
  const singleUpload = upload.single('image')

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File ảnh không được vượt quá 5MB' })
      }
      return res.status(400).json({ message: `Lỗi upload: ${err.message}` })
    }
    if (err) {
      return res.status(400).json({ message: err.message })
    }
    next()
  })
}

// Helper: xóa file ảnh cũ
const deleteImage = (imagePath) => {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return

  const fullPath = path.join(__dirname, '../..', imagePath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

module.exports = { uploadImage, deleteImage }
