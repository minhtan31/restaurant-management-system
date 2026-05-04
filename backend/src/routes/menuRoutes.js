const express = require('express')
const router = express.Router()
const {
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/menuController')
const { protect, adminOnly } = require('../middleware/auth')
const { uploadImage } = require('../middleware/upload')
const { validate } = require('../middleware/validate')
const { validateCreateMenu, validateUpdateMenu } = require('../validators/menuValidator')

router.get('/', getMenuItems)
router.post('/', protect, adminOnly, uploadImage, validate(validateCreateMenu), createMenuItem)
router.get('/:id', getMenuItem)
router.put('/:id', protect, adminOnly, uploadImage, validate(validateUpdateMenu), updateMenuItem)
router.delete('/:id', protect, adminOnly, deleteMenuItem)

module.exports = router
