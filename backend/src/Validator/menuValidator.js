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
  // Lưu ý: Khi dùng multipart/form-data, price sẽ là string → parse
  const price = typeof body.price === 'string' ? Number(body.price) : body.price
  if (price === undefined || price === null || body.price === '') {
    errors.push('Vui lòng nhập giá')
  } else if (typeof price !== 'number' || isNaN(price)) {
    errors.push('Giá phải là một số')
  } else if (price < 0) {
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

  // image - không validate ở đây, do Multer middleware xử lý
  // Nếu gửi kèm file thì req.file sẽ có, req.body.image sẽ không tồn tại

  // available - optional, boolean hoặc string 'true'/'false' (multipart)
  if (body.available !== undefined && body.available !== null) {
    const available = typeof body.available === 'string'
      ? (body.available === 'true' || body.available === 'false' ? body.available === 'true' : null)
      : body.available
    if (typeof available !== 'boolean') {
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

  // price - optional (multipart: string → number)
  if (body.price !== undefined && body.price !== null && body.price !== '') {
    const price = typeof body.price === 'string' ? Number(body.price) : body.price
    if (typeof price !== 'number' || isNaN(price)) {
      errors.push('Giá phải là một số')
    } else if (price < 0) {
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

  // image - không validate, do Multer xử lý

  // available - optional (multipart: string → boolean)
  if (body.available !== undefined && body.available !== null) {
    const available = typeof body.available === 'string'
      ? (body.available === 'true' || body.available === 'false' ? body.available === 'true' : null)
      : body.available
    if (typeof available !== 'boolean') {
      errors.push('Trạng thái có sẵn phải là true hoặc false')
    }
  }

  return errors
}

module.exports = { validateCreateMenu, validateUpdateMenu }
