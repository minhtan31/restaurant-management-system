const Table = require('../models/Table')

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
const getTables = async (req, res) => {
  try {
    const { floor, status } = req.query
    const filter = {}
    if (floor) filter.floor = parseInt(floor)
    if (status) filter.status = status

    const tables = await Table.find(filter).sort({ number: 1 })
    res.json(tables)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Private
const getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
    if (!table) {
      return res.status(404).json({ message: 'Không tìm thấy bàn' })
    }
    res.json(table)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create table
// @route   POST /api/tables
// @access  Private (Admin)
const createTable = async (req, res) => {
  try {
    // Chỉ cho phép các field hợp lệ
    const { number, seats, floor, status } = req.body
    const sanitizedData = { number, seats }
    if (floor !== undefined) sanitizedData.floor = floor
    if (status) sanitizedData.status = status

    const table = await Table.create(sanitizedData)
    res.status(201).json(table)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private (Admin)
const updateTable = async (req, res) => {
  try {
    // Chỉ cho phép các field hợp lệ
    const allowedFields = ['number', 'seats', 'floor', 'status']
    const updateData = {}
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    })

    const table = await Table.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
    if (!table) {
      return res.status(404).json({ message: 'Không tìm thấy bàn' })
    }
    res.json(table)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private (Admin)
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id)
    if (!table) {
      return res.status(404).json({ message: 'Không tìm thấy bàn' })
    }
    res.json({ message: 'Đã xóa bàn thành công' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update table status
// @route   PATCH /api/tables/:id/status
// @access  Private
const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    if (!table) {
      return res.status(404).json({ message: 'Không tìm thấy bàn' })
    }
    res.json(table)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getTables, getTable, createTable, updateTable, deleteTable, updateTableStatus }
