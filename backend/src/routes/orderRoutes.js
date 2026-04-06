const express = require('express')
const router = express.Router()
const {
  getOrders, getOrder, createOrder, updateOrder,
  updateOrderStatus, deleteOrder, payOrder, getRevenueReport, addItems,
} = require('../controllers/orderController')
const { protect, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const {
  validateCreateOrder, validateUpdateOrder,
  validateUpdateOrderStatus, validatePayOrder,
} = require('../validators/orderValidator')




router.get('/', protect, getOrders)
router.post('/', protect, validate(validateCreateOrder), createOrder)
router.get('/:id', protect, getOrder)
router.put('/:id', protect, validate(validateUpdateOrder), updateOrder)
router.delete('/:id', protect, deleteOrder)
router.patch('/:id/status', protect, validate(validateUpdateOrderStatus), updateOrderStatus)
router.post('/:id/pay', protect, validate(validatePayOrder), payOrder)
router.post('/:id/items', protect, addItems)
router.get('/reports/revenue', protect, adminOnly, getRevenueReport)


module.exports = router
