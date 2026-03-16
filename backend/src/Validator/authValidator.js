const { isValidEmail, isValidPhone } = require('../middleware/validate')

const validateRegister = (body) => {
  const errors = []

  // name - bắt buộc, 2-50 ký tự
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Vui lòng nhập họ tên')
  } else if (body.name.trim().length < 2) {
    errors.push('Họ tên phải có ít nhất 2 ký tự')
  } else if (body.name.trim().length > 50) {
    errors.push('Họ tên không được vượt quá 50 ký tự')
  }

  // email - bắt buộc, đúng format
  if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
    errors.push('Vui lòng nhập email')
  } else if (!isValidEmail(body.email.trim())) {
    errors.push('Email không hợp lệ')
  }

  // password - bắt buộc, ≥6 ký tự
  if (!body.password || typeof body.password !== 'string') {
    errors.push('Vui lòng nhập mật khẩu')
  } else if (body.password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự')
  } else if (body.password.length > 128) {
    errors.push('Mật khẩu không được vượt quá 128 ký tự')
  }

  // phone - optional, nếu có phải đúng format
  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    if (typeof body.phone !== 'string') {
      errors.push('Số điện thoại không hợp lệ')
    } else if (!isValidPhone(body.phone)) {
      errors.push('Số điện thoại không hợp lệ (VD: 0912345678)')
    }
  }

  // role - optional, phải là admin hoặc staff
  if (body.role !== undefined && body.role !== null && body.role !== '') {
    const validRoles = ['admin', 'staff']
    if (!validRoles.includes(body.role)) {
      errors.push(`Role phải là một trong: ${validRoles.join(', ')}`)
    }
  }

  return errors
}

const validateLogin = (body) => {
  const errors = []

  // email - bắt buộc
  if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
    errors.push('Vui lòng nhập email')
  } else if (!isValidEmail(body.email.trim())) {
    errors.push('Email không hợp lệ')
  }

  // password - bắt buộc
  if (!body.password || typeof body.password !== 'string' || body.password.length === 0) {
    errors.push('Vui lòng nhập mật khẩu')
  }

  return errors
}

module.exports = { validateRegister, validateLogin }
