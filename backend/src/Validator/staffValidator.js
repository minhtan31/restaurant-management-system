const { isValidEmail, isValidPhone } = require('../middleware/validate')

const VALID_STATUSES = ['active', 'inactive']

const validateCreateStaff = (body) => {
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
  if (!body.password || typeof body.password !== 'string' || body.password.length === 0) {
    errors.push('Vui lòng nhập mật khẩu')
  } else if (body.password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự')
  }

  // phone - optional
  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    if (typeof body.phone !== 'string') {
      errors.push('Số điện thoại không hợp lệ')
    } else if (!isValidPhone(body.phone)) {
      errors.push('Số điện thoại không hợp lệ (VD: 0912345678)')
    }
  }

  // status - optional
  if (body.status !== undefined && body.status !== null && body.status !== '') {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push(`Trạng thái phải là một trong: ${VALID_STATUSES.join(', ')}`)
    }
  }

  return errors
}

const validateUpdateStaff = (body) => {
  const errors = []

  // name - optional
  if (body.name !== undefined && body.name !== null) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Họ tên không được để trống')
    } else if (body.name.trim().length < 2) {
      errors.push('Họ tên phải có ít nhất 2 ký tự')
    } else if (body.name.trim().length > 50) {
      errors.push('Họ tên không được vượt quá 50 ký tự')
    }
  }

  // email - optional
  if (body.email !== undefined && body.email !== null) {
    if (typeof body.email !== 'string' || body.email.trim().length === 0) {
      errors.push('Email không được để trống')
    } else if (!isValidEmail(body.email.trim())) {
      errors.push('Email không hợp lệ')
    }
  }

  // phone - optional
  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    if (typeof body.phone !== 'string') {
      errors.push('Số điện thoại không hợp lệ')
    } else if (!isValidPhone(body.phone)) {
      errors.push('Số điện thoại không hợp lệ (VD: 0912345678)')
    }
  }

  // status - optional
  if (body.status !== undefined && body.status !== null && body.status !== '') {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push(`Trạng thái phải là một trong: ${VALID_STATUSES.join(', ')}`)
    }
  }

  return errors
}

module.exports = { validateCreateStaff, validateUpdateStaff }
