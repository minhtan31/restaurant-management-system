const menuService = require('../services/menuService')

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
    const item = await menuService.create(req.body)
    res.status(201).json(item)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const updateMenuItem = async (req, res) => {
  try {
    const item = await menuService.update(req.params.id, req.body)
    res.json(item)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const deleteMenuItem = async (req, res) => {
  try {
    const result = await menuService.remove(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

module.exports = { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem }
