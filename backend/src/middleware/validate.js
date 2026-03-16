// Validation middleware - chạy validator function và trả về lỗi nếu có
const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.body, req.params, req.query)
    if (errors && errors.length > 0) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors,
      })
    }
    next()
  }
}

// Helper functions cho validation
const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

const isValidPhone = (phone) => {
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone.replace(/\s/g, ''))
}

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0
}

const isNonNegativeNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0
}

module.exports = { validate, isValidEmail, isValidPhone, isPositiveInteger, isNonNegativeNumber }
