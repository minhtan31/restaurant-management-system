const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./src/config/db')


// Load env vars
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Restaurant Management API is running',
    timestamp: new Date().toISOString(),
  })
})



const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`
  🍽️  Restaurant Management API
  ================================
  🚀 Server running on port ${PORT}
  `)
})
