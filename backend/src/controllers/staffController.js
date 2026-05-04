const staffService = require('../services/staffService')

const getStaff = async (req, res) => {
  try {
    const staff = await staffService.getAll(req.query)
    res.json(staff)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const getStaffMember = async (req, res) => {
  try {
    const member = await staffService.getById(req.params.id)
    res.json(member)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const createStaff = async (req, res) => {
  try {
    const member = await staffService.create(req.body)
    res.status(201).json(member)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const updateStaff = async (req, res) => {
  try {
    const member = await staffService.update(req.params.id, req.body)
    res.json(member)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const deleteStaff = async (req, res) => {
  try {
    const result = await staffService.remove(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

module.exports = { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff }
