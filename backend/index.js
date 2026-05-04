const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const connectDB = require('./src/config/db')
const { errorHandler, notFound } = require('./src/middleware/errorHandler')

// Load env vars
dotenv.config()

// Connect to database
connectDB()

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const app = express()

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'))
app.use('/api/tables', require('./src/routes/tableRoutes'))
app.use('/api/menu', require('./src/routes/menuRoutes'))
app.use('/api/orders', require('./src/routes/orderRoutes'))
app.use('/api/staff', require('./src/routes/staffRoutes'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Restaurant Management API is running',
    timestamp: new Date().toISOString(),
  })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`
  🍽️  Restaurant Management API
  ================================
  🚀 Server running on port ${PORT}
  `)
})
