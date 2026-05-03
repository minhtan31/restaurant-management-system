const Order = require('../models/Order')
const Table = require('../models/Table')

/**
 * Get all orders with optional filters
 * @param {Object} query - { status?, tableNumber? }
 * @returns {Array} orders
 */
const getAll = async ({ status, tableNumber } = {}) => {
  const filter = {}
  if (status && status !== 'all') filter.status = status
  if (tableNumber) filter.tableNumber = parseInt(tableNumber)

  return await Order.find(filter).sort({ createdAt: -1 })
}

/**
 * Get a single order by ID
 * @param {string} id
 * @returns {Object} order
 */
const getById = async (id) => {
  const order = await Order.findById(id)
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng')
    error.statusCode = 404
    throw error
  }
  return order
}

/**
 * Create a new order
 * @param {Object} data - { tableNumber, items, createdBy? }
 * @param {Object} user - authenticated user (optional)
 * @returns {Object} created order
 */
const create = async ({ tableNumber, items, createdBy }, user) => {
  const sanitizedItems = items.map((item) => ({
    menuItem: {
      name: item.menuItem.name.trim(),
      price: item.menuItem.price,
    },
    quantity: item.quantity || 1,
    notes: item.notes ? item.notes.trim() : '',
  }))

  const order = await Order.create({
    tableNumber,
    items: sanitizedItems,
    createdBy: createdBy ? createdBy.trim() : (user?.name || 'Nhân viên'),
  })

  // Tự động cập nhật bàn → occupied
  await Table.findOneAndUpdate(
    { number: tableNumber },
    { status: 'occupied' }
  )

  return order
}

/**
 * Update an existing order
 * @param {string} id
 * @param {Object} data - fields to update
 * @returns {Object} updated order
 */
const update = async (id, data) => {
  const order = await Order.findById(id)
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng')
    error.statusCode = 404
    throw error
  }

  const allowedFields = ['tableNumber', 'items', 'status', 'discount']
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (field === 'items') {
        order.items = data.items.map((item) => ({
          menuItem: {
            name: item.menuItem.name.trim(),
            price: item.menuItem.price,
          },
          quantity: item.quantity || 1,
          notes: item.notes ? item.notes.trim() : '',
        }))
      } else {
        order[field] = data[field]
      }
    }
  })

  return await order.save()
}

/**
 * Add items to an existing order
 * @param {string} id
 * @param {Array} items - new items to add
 * @returns {Object} updated order
 */
const addItems = async (id, items) => {
  const order = await Order.findById(id)
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng')
    error.statusCode = 404
    throw error
  }

  if (order.status === 'completed') {
    const error = new Error('Đơn hàng đã hoàn thành, không thể thêm món')
    error.statusCode = 400
    throw error
  }

  const sanitizedItems = items.map((item) => ({
    menuItem: {
      name: item.menuItem.name.trim(),
      price: item.menuItem.price,
    },
    quantity: item.quantity || 1,
    notes: item.notes ? item.notes.trim() : '',
  }))

  // Gộp món trùng tên, thêm món mới
  sanitizedItems.forEach((newItem) => {
    const existing = order.items.find(i => i.menuItem.name === newItem.menuItem.name)
    if (existing) {
      existing.quantity += newItem.quantity
      if (newItem.notes && !existing.notes) {
        existing.notes = newItem.notes
      }
    } else {
      order.items.push(newItem)
    }
  })

  // Chuyển trạng thái về "preparing" vì có món mới cần chuẩn bị
  order.status = 'preparing'

  return await order.save()
}

/**
 * Update order status
 * @param {string} id
 * @param {string} status
 * @returns {Object} updated order
 */
const updateStatus = async (id, status) => {
  const order = await Order.findById(id)
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng')
    error.statusCode = 404
    throw error
  }

  order.status = status
  if (status === 'completed') {
    order.paidAt = new Date()
  }
  return await order.save()
}

/**
 * Delete an order
 * @param {string} id
 * @returns {Object} success message
 */
const remove = async (id) => {
  const order = await Order.findByIdAndDelete(id)
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng')
    error.statusCode = 404
    throw error
  }
  return { message: 'Đã xóa đơn hàng thành công' }
}

/**
 * Pay order (apply discount & complete)
 * @param {string} id
 * @param {Object} data - { discount?, paymentMethod?, amountReceived? }
 * @returns {Object} updated order
 */
const pay = async (id, { discount, paymentMethod, amountReceived }) => {
  const order = await Order.findById(id)
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng')
    error.statusCode = 404
    throw error
  }

  order.discount = discount || 0
  order.paymentMethod = paymentMethod || 'cash'
  order.amountReceived = paymentMethod === 'cash' ? (amountReceived || 0) : 0
  order.status = 'completed'
  order.paidAt = new Date()
  const updatedOrder = await order.save()

  // Tự động giải phóng bàn → available
  await Table.findOneAndUpdate(
    { number: order.tableNumber },
    { status: 'available' }
  )

  return updatedOrder
}

/**
 * Get revenue report
 * @param {Object} query - { startDate?, endDate? }
 * @returns {Object} revenue report
 */
const getRevenueReport = async ({ startDate, endDate } = {}) => {
  const filter = { status: 'completed' }

  if (startDate && endDate) {
    filter.paidAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    }
  }

  const orders = await Order.find(filter)
  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount), 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    orders,
  }
}

module.exports = {
  getAll, getById, create, update, addItems,
  updateStatus, remove, pay, getRevenueReport,
}
