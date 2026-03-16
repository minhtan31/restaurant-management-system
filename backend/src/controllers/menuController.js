const MenuItem = require('../models/MenuItem')

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Private
const getMenuItems = async (req, res) => {
  try {
    const { category, search, available } = req.query
    const filter = {}
    if (category && category !== 'Tất cả') filter.category = category
    if (available !== undefined) filter.available = available === 'true'
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Private
const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' })
    }
    res.json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private (Admin)
const createMenuItem = async (req, res) => {
  try {
    // Chỉ cho phép các field hợp lệ
    const { name, price, category, description, image, available } = req.body
    const sanitizedData = {
      name: name.trim(),
      price,
      category,
    }
    if (description !== undefined) sanitizedData.description = description.trim()
    if (image !== undefined) sanitizedData.image = image
    if (available !== undefined) sanitizedData.available = available

    const item = await MenuItem.create(sanitizedData)
    res.status(201).json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin)
const updateMenuItem = async (req, res) => {
  try {
    // Chỉ cho phép các field hợp lệ
    const allowedFields = ['name', 'price', 'category', 'description', 'image', 'available']
    const updateData = {}
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field]
      }
    })

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' })
    }
    res.json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin)
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' })
    }
    res.json({ message: 'Đã xóa món ăn thành công' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem }
