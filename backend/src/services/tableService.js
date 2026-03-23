const Table = require('../models/Table')


const getAll = async ({ floor, status } = {}) => {
  const filter = {}
  if (floor) filter.floor = parseInt(floor)
  if (status) filter.status = status

  return await Table.find(filter).sort({ number: 1 })
}

const getById = async (id) => {
  const table = await Table.findById(id)
  if (!table) {
    const error = new Error('Không tìm thấy bàn')
    error.statusCode = 404
    throw error
  }
  return table
}


const create = async ({ number, seats, floor, status }) => {
  const sanitizedData = { number, seats }
  if (floor !== undefined) sanitizedData.floor = floor
  if (status) sanitizedData.status = status

  return await Table.create(sanitizedData)
}

const update = async (id, data) => {
  const allowedFields = ['number', 'seats', 'floor', 'status']
  const updateData = {}
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field]
    }
  })

  const table = await Table.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
  if (!table) {
    const error = new Error('Không tìm thấy bàn')
    error.statusCode = 404
    throw error
  }
  return table
}

const remove = async (id) => {
  const table = await Table.findByIdAndDelete(id)
  if (!table) {
    const error = new Error('Không tìm thấy bàn')
    error.statusCode = 404
    throw error
  }
  return { message: 'Đã xóa bàn thành công' }
}

const updateStatus = async (id, status) => {
  const table = await Table.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
  if (!table) {
    const error = new Error('Không tìm thấy bàn')
    error.statusCode = 404
    throw error
  }
  return table
}

module.exports = { getAll, getById, create, update, remove, updateStatus }
