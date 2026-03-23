const MenuItem = require('../models/MenuItem')

/**
 * Get all menu items with optional filters
 * @param {Object} query - { category?, search?, available? }
 * @returns {Array} menu items
 */
const getAll = async ({ category, search, available } = {}) => {
  const filter = {}
  if (category && category !== 'Tất cả') filter.category = category
  if (available !== undefined) filter.available = available === 'true'
  if (search) {
    filter.name = { $regex: search, $options: 'i' }
  }

  return await MenuItem.find(filter).sort({ category: 1, name: 1 })
}

/**
 * Get a single menu item by ID
 * @param {string} id
 * @returns {Object} menu item
 */
const getById = async (id) => {
  const item = await MenuItem.findById(id)
  if (!item) {
    const error = new Error('Không tìm thấy món ăn')
    error.statusCode = 404
    throw error
  }
  return item
}

/**
 * Create a new menu item
 * @param {Object} data - { name, price, category, description?, image?, available? }
 * @returns {Object} created menu item
 */
const create = async ({ name, price, category, description, image, available }) => {
  const sanitizedData = {
    name: name.trim(),
    price,
    category,
  }
  if (description !== undefined) sanitizedData.description = description.trim()
  if (image !== undefined) sanitizedData.image = image
  if (available !== undefined) sanitizedData.available = available

  return await MenuItem.create(sanitizedData)
}

/**
 * Update an existing menu item
 * @param {string} id
 * @param {Object} data - fields to update
 * @returns {Object} updated menu item
 */
const update = async (id, data) => {
  const allowedFields = ['name', 'price', 'category', 'description', 'image', 'available']
  const updateData = {}
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = typeof data[field] === 'string' ? data[field].trim() : data[field]
    }
  })

  const item = await MenuItem.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
  if (!item) {
    const error = new Error('Không tìm thấy món ăn')
    error.statusCode = 404
    throw error
  }
  return item
}

/**
 * Delete a menu item
 * @param {string} id
 * @returns {Object} success message
 */
const remove = async (id) => {
  const item = await MenuItem.findByIdAndDelete(id)
  if (!item) {
    const error = new Error('Không tìm thấy món ăn')
    error.statusCode = 404
    throw error
  }
  return { message: 'Đã xóa món ăn thành công' }
}

module.exports = { getAll, getById, create, update, remove }
