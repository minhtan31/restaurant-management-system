const VALID_STATUSES = ['preparing', 'serving', 'completed']

const validateCreateOrder = (body) => {
  const errors = []

  // tableNumber - bắt buộc, số nguyên > 0
  if (body.tableNumber === undefined || body.tableNumber === null) {
    errors.push('Vui lòng chọn bàn')
  } else if (!Number.isInteger(body.tableNumber) || body.tableNumber <= 0) {
    errors.push('Số bàn phải là số nguyên dương')
  }

  // items - bắt buộc, mảng không rỗng
  if (!body.items || !Array.isArray(body.items)) {
    errors.push('Vui lòng thêm món vào đơn hàng')
  } else if (body.items.length === 0) {
    errors.push('Đơn hàng phải có ít nhất một món')
  } else {
    body.items.forEach((item, index) => {
      // Kiểm tra menuItem
      if (!item.menuItem) {
        errors.push(`Món #${index + 1}: Thiếu thông tin món ăn`)
      } else {
        if (!item.menuItem.name || typeof item.menuItem.name !== 'string' || item.menuItem.name.trim().length === 0) {
          errors.push(`Món #${index + 1}: Thiếu tên món`)
        }
        if (item.menuItem.price === undefined || item.menuItem.price === null) {
          errors.push(`Món #${index + 1}: Thiếu giá món`)
        } else if (typeof item.menuItem.price !== 'number' || item.menuItem.price < 0) {
          errors.push(`Món #${index + 1}: Giá món không hợp lệ`)
        }
      }
      // Kiểm tra quantity
      if (item.quantity !== undefined && item.quantity !== null) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          errors.push(`Món #${index + 1}: Số lượng phải là số nguyên >= 1`)
        }
      }
    })
  }

  // createdBy - optional, string
  if (body.createdBy !== undefined && body.createdBy !== null) {
    if (typeof body.createdBy !== 'string' || body.createdBy.trim().length === 0) {
      errors.push('Tên người tạo không hợp lệ')
    }
  }

  return errors
}

const validateUpdateOrder = (body) => {
  const errors = []

  // tableNumber - optional
  if (body.tableNumber !== undefined && body.tableNumber !== null) {
    if (!Number.isInteger(body.tableNumber) || body.tableNumber <= 0) {
      errors.push('Số bàn phải là số nguyên dương')
    }
  }

  // items - optional, nhưng nếu có phải là mảng hợp lệ
  if (body.items !== undefined && body.items !== null) {
    if (!Array.isArray(body.items)) {
      errors.push('Danh sách món phải là một mảng')
    } else if (body.items.length === 0) {
      errors.push('Đơn hàng phải có ít nhất một món')
    } else {
      body.items.forEach((item, index) => {
        if (!item.menuItem) {
          errors.push(`Món #${index + 1}: Thiếu thông tin món ăn`)
        } else {
          if (!item.menuItem.name || typeof item.menuItem.name !== 'string') {
            errors.push(`Món #${index + 1}: Thiếu tên món`)
          }
          if (item.menuItem.price === undefined || typeof item.menuItem.price !== 'number' || item.menuItem.price < 0) {
            errors.push(`Món #${index + 1}: Giá món không hợp lệ`)
          }
        }
        if (item.quantity !== undefined && (!Number.isInteger(item.quantity) || item.quantity < 1)) {
          errors.push(`Món #${index + 1}: Số lượng phải là số nguyên >= 1`)
        }
      })
    }
  }

  // status - optional
  if (body.status !== undefined && body.status !== null) {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push(`Trạng thái phải là một trong: ${VALID_STATUSES.join(', ')}`)
    }
  }

  // discount - optional
  if (body.discount !== undefined && body.discount !== null) {
    if (typeof body.discount !== 'number' || isNaN(body.discount)) {
      errors.push('Giảm giá phải là một số')
    } else if (body.discount < 0 || body.discount > 100) {
      errors.push('Giảm giá phải từ 0 đến 100')
    }
  }

  return errors
}

const validateUpdateOrderStatus = (body) => {
  const errors = []

  if (!body.status || typeof body.status !== 'string') {
    errors.push('Vui lòng chọn trạng thái')
  } else if (!VALID_STATUSES.includes(body.status)) {
    errors.push(`Trạng thái phải là một trong: ${VALID_STATUSES.join(', ')}`)
  }

  return errors
}

const validatePayOrder = (body) => {
  const errors = []

  if (body.discount !== undefined && body.discount !== null) {
    if (typeof body.discount !== 'number' || isNaN(body.discount)) {
      errors.push('Giảm giá phải là một số')
    } else if (body.discount < 0 || body.discount > 100) {
      errors.push('Giảm giá phải từ 0 đến 100')
    }
  }

  return errors
}

module.exports = { validateCreateOrder, validateUpdateOrder, validateUpdateOrderStatus, validatePayOrder }
