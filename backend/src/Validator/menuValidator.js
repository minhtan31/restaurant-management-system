const VALID_CATEGORIES = ['Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng']

const validateCreateMenu = (body) => {
  const errors = []

  // name - bắt buộc
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Vui lòng nhập tên món')
  } else if (body.name.trim().length > 100) {
    errors.push('Tên món không được vượt quá 100 ký tự')
  }

  // price - bắt buộc, số >= 0
  if (body.price === undefined || body.price === null) {
    errors.push('Vui lòng nhập giá')
  } else if (typeof body.price !== 'number' || isNaN(body.price)) {
    errors.push('Giá phải là một số')
  } else if (body.price < 0) {
    errors.push('Giá không được âm')
  }

  // category - bắt buộc, trong danh sách cho phép
  if (!body.category || typeof body.category !== 'string' || body.category.trim().length === 0) {
    errors.push('Vui lòng chọn loại món')
  } else if (!VALID_CATEGORIES.includes(body.category)) {
    errors.push(`Loại món phải là một trong: ${VALID_CATEGORIES.join(', ')}`)
  }

  // description - optional, string
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      errors.push('Mô tả phải là chuỗi ký tự')
    } else if (body.description.length > 500) {
      errors.push('Mô tả không được vượt quá 500 ký tự')
    }
  }

  // image - optional, string
  if (body.image !== undefined && body.image !== null) {
    if (typeof body.image !== 'string') {
      errors.push('Link hình ảnh phải là chuỗi ký tự')
    }
  }

  // available - optional, boolean
  if (body.available !== undefined && body.available !== null) {
    if (typeof body.available !== 'boolean') {
      errors.push('Trạng thái có sẵn phải là true hoặc false')
    }
  }

  return errors
}

const validateUpdateMenu = (body) => {
  const errors = []

  // name - optional, nhưng nếu có phải hợp lệ
  if (body.name !== undefined && body.name !== null) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Tên món không được để trống')
    } else if (body.name.trim().length > 100) {
      errors.push('Tên món không được vượt quá 100 ký tự')
    }
  }

  // price - optional
  if (body.price !== undefined && body.price !== null) {
    if (typeof body.price !== 'number' || isNaN(body.price)) {
      errors.push('Giá phải là một số')
    } else if (body.price < 0) {
      errors.push('Giá không được âm')
    }
  }

  // category - optional
  if (body.category !== undefined && body.category !== null) {
    if (!VALID_CATEGORIES.includes(body.category)) {
      errors.push(`Loại món phải là một trong: ${VALID_CATEGORIES.join(', ')}`)
    }
  }

  // description - optional
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      errors.push('Mô tả phải là chuỗi ký tự')
    } else if (body.description.length > 500) {
      errors.push('Mô tả không được vượt quá 500 ký tự')
    }
  }

  // image - optional
  if (body.image !== undefined && body.image !== null) {
    if (typeof body.image !== 'string') {
      errors.push('Link hình ảnh phải là chuỗi ký tự')
    }
  }

  // available - optional
  if (body.available !== undefined && body.available !== null) {
    if (typeof body.available !== 'boolean') {
      errors.push('Trạng thái có sẵn phải là true hoặc false')
    }
  }

  return errors
}

module.exports = { validateCreateMenu, validateUpdateMenu }
