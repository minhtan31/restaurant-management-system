const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const connectDB = require('./src/config/db')
const { errorHandler, notFound } = require('./src/middleware/errorHandler')


dotenv.config()


connectDB()

const app = express()

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'))


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
