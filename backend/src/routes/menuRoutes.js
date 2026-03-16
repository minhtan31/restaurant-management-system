const express = require('express')
const router = express.Router()
const {
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/menuController')
const { protect, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { validateCreateMenu, validateUpdateMenu } = require('../validators/menuValidator')

router.route('/')
  .get(getMenuItems)
  .post(protect, adminOnly, validate(validateCreateMenu), createMenuItem)

router.route('/:id')
  .get(getMenuItem)
  .put(protect, adminOnly, validate(validateUpdateMenu), updateMenuItem)
  .delete(protect, adminOnly, deleteMenuItem)

module.exports = router
