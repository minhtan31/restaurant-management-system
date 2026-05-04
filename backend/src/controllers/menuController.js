const menuService = require('../services/menuService')
const { deleteImage } = require('../middleware/upload')

const getMenuItems = async (req, res) => {
  try {
    const items = await menuService.getAll(req.query)
    res.json(items)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}


const getMenuItem = async (req, res) => {
  try {
    const item = await menuService.getById(req.params.id)
    res.json(item)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const createMenuItem = async (req, res) => {
  try {
    // Nếu có file upload, set image path
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`
    }

    // Parse lại các field bị string hóa bởi multipart/form-data
    if (typeof req.body.price === 'string') {
      req.body.price = Number(req.body.price)
    }
    if (typeof req.body.available === 'string') {
      req.body.available = req.body.available === 'true'
    }

    const item = await menuService.create(req.body)
    res.status(201).json(item)
  } catch (error) {
    // Nếu tạo thất bại, xóa file đã upload
    if (req.file) {
      deleteImage(`/uploads/${req.file.filename}`)
    }
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const updateMenuItem = async (req, res) => {
  try {
    // Parse lại các field bị string hóa bởi multipart/form-data
    if (typeof req.body.price === 'string') {
      req.body.price = Number(req.body.price)
    }
    if (typeof req.body.available === 'string') {
      req.body.available = req.body.available === 'true'
    }

    // Nếu có file upload mới, xóa ảnh cũ và set path mới
    if (req.file) {
      const oldItem = await menuService.getById(req.params.id)
      if (oldItem.image) {
        deleteImage(oldItem.image)
      }
      req.body.image = `/uploads/${req.file.filename}`
    }

    const item = await menuService.update(req.params.id, req.body)
    res.json(item)
  } catch (error) {
    // Nếu update thất bại, xóa file mới đã upload
    if (req.file) {
      deleteImage(`/uploads/${req.file.filename}`)
    }
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const deleteMenuItem = async (req, res) => {
  try {
    // Lấy item trước khi xóa để biết ảnh cần xóa
    const item = await menuService.getById(req.params.id)
    const result = await menuService.remove(req.params.id)

    // Xóa file ảnh liên quan
    if (item.image) {
      deleteImage(item.image)
    }

    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

module.exports = { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem }
