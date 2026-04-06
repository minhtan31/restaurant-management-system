const orderService = require('../services/orderService')

const getOrders = async (req, res) => {
  try {
    const orders = await orderService.getAll(req.query)
    res.json(orders)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const getOrder = async (req, res) => {
  try {
    const order = await orderService.getById(req.params.id)
    res.json(order)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const createOrder = async (req, res) => {
  try {
    const order = await orderService.create(req.body, req.user)
    res.status(201).json(order)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const updateOrder = async (req, res) => {
  try {
    const order = await orderService.update(req.params.id, req.body)
    res.json(order)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const addItems = async (req, res) => {
  try {
    const order = await orderService.addItems(req.params.id, req.body.items)
    res.json(order)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status)
    res.json(order)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const deleteOrder = async (req, res) => {
  try {
    const result = await orderService.remove(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const payOrder = async (req, res) => {
  try {
    const order = await orderService.pay(req.params.id, req.body)
    res.json(order)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

const getRevenueReport = async (req, res) => {
  try {
    const report = await orderService.getRevenueReport(req.query)
    res.json(report)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message })
  }
}

module.exports = {
  getOrders, getOrder, createOrder, updateOrder, updateOrderStatus,
  deleteOrder, payOrder, getRevenueReport, addItems,
}
