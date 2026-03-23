const User = require('../models/User')
const jwt = require('jsonwebtoken')

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'restaurant_management_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

/**
 * Register a new user
 * @param {Object} data - { name, email, password, phone?, role? }
 * @returns {Object} user data with token
 */
const registerUser = async ({ name, email, password, phone, role }) => {
  const sanitizedData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  }
  if (phone) sanitizedData.phone = phone.trim()
  if (role) sanitizedData.role = role

  // Check if user exists
  const userExists = await User.findOne({ email: sanitizedData.email })
  if (userExists) {
    const error = new Error('Email đã được đăng ký')
    error.statusCode = 400
    throw error
  }

  const user = await User.create(sanitizedData)

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id),
  }
}

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Object} user data with token
 */
const loginUser = async (email, password) => {
  const sanitizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: sanitizedEmail }).select('+password')
  if (!user) {
    const error = new Error('Email hoặc mật khẩu không đúng')
    error.statusCode = 401
    throw error
  }

  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không đúng')
    error.statusCode = 401
    throw error
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token: generateToken(user._id),
  }
}

/**
 * Get user by ID
 * @param {string} id
 * @returns {Object} user data
 */
const getUserById = async (id) => {
  const user = await User.findById(id)
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}

module.exports = { registerUser, loginUser, getUserById }
