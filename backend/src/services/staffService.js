const User = require('../models/User')


const getAll = async ({ status, search } = {}) => {
  const filter = { role: 'staff' }
  if (status) filter.status = status
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  return await User.find(filter).select('-password').sort({ name: 1 })
}

const getById = async (id) => {
  const member = await User.findById(id).select('-password')
  if (!member || member.role !== 'staff') {
    const error = new Error('Không tìm thấy nhân viên')
    error.statusCode = 404
    throw error
  }
  return member
}

const create = async ({ name, email, password, phone, status }) => {
  const sanitizedData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: 'staff',
  }
  if (phone) sanitizedData.phone = phone.trim()
  if (status) sanitizedData.status = status

  // Check if email already exists
  const existingUser = await User.findOne({ email: sanitizedData.email })
  if (existingUser) {
    const error = new Error('Email đã được sử dụng')
    error.statusCode = 400
    throw error
  }

  const member = await User.create(sanitizedData)
  const memberObj = member.toObject()
  delete memberObj.password
  return memberObj
}

const update = async (id, data) => {
  const allowedFields = ['name', 'email', 'phone', 'status']
  const updateData = {}
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (field === 'email') {
        updateData[field] = data[field].trim().toLowerCase()
      } else if (typeof data[field] === 'string') {
        updateData[field] = data[field].trim()
      } else {
        updateData[field] = data[field]
      }
    }
  })

  const member = await User.findOneAndUpdate(
    { _id: id, role: 'staff' },
    updateData,
    { new: true, runValidators: true }
  ).select('-password')

  if (!member) {
    const error = new Error('Không tìm thấy nhân viên')
    error.statusCode = 404
    throw error
  }
  return member
}
const remove = async (id) => {
  const member = await User.findOneAndDelete({ _id: id, role: 'staff' })
  if (!member) {
    const error = new Error('Không tìm thấy nhân viên')
    error.statusCode = 404
    throw error
  }
  return { message: 'Đã xóa nhân viên thành công' }
}

module.exports = { getAll, getById, create, update, remove }
