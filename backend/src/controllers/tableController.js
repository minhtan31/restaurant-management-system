const tableService = require('../services/tableService')

const getTables = async (req, res) => {
  try {
    const tables = await tableService.getAll(req.query)
    res.json(tables)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const getTable = async (req, res) => {
  try {
    const table = await tableService.getById(req.params.id)
    res.json(table)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const createTable = async (req, res) => {
  try {
    const table = await tableService.create(req.body)
    res.status(201).json(table)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const updateTable = async (req, res) => {
  try {
    const table = await tableService.update(req.params.id, req.body)
    res.json(table)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const deleteTable = async (req, res) => {
  try {
    const result = await tableService.remove(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const updateTableStatus = async (req, res) => {
  try {
    const table = await tableService.updateStatus(req.params.id, req.body.status)
    res.json(table)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

module.exports = { getTables, getTable, createTable, updateTable, deleteTable, updateTableStatus }
