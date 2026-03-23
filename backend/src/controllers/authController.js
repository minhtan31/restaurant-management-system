const authService = require('../services/authService')

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}


const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.loginUser(email, password)
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const getMe = async (req, res) => {
  try {
    const result = await authService.getUserById(req.user._id)
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

module.exports = { register, login, getMe }
