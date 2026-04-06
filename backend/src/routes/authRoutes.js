const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { validateRegister, validateLogin } = require('../Validator/authValidator')

router.post('/register', validate(validateRegister), register)
router.post('/login', validate(validateLogin), login)
router.get('/me', protect, getMe)

module.exports = router
