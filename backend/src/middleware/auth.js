const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'restaurant_management_secret_key_2026')
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401).json({ message: 'Token không hợp lệ' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Chưa đăng nhập, không có token' })
  }
}

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Chỉ Admin mới có quyền truy cập' })
  }
}

module.exports = { protect, adminOnly }
