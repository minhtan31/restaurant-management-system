const express = require('express')
const router = express.Router()
const {
  getStaff, getStaffMember, createStaff, updateStaff, deleteStaff,
} = require('../controllers/staffController')
const { protect, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { validateCreateStaff, validateUpdateStaff } = require('../validators/staffValidator')

router.get('/', protect, adminOnly, getStaff)
router.post('/', protect, adminOnly, validate(validateCreateStaff), createStaff)
router.get('/:id', protect, adminOnly, getStaffMember)
router.put('/:id', protect, adminOnly, validate(validateUpdateStaff), updateStaff)
router.delete('/:id', protect, adminOnly, deleteStaff)

module.exports = router
