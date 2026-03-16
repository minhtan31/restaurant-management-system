const express = require('express')
const router = express.Router()
const {
  getStaff, getStaffMember, createStaff, updateStaff, deleteStaff,
} = require('../controllers/staffController')
const { protect, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { validateCreateStaff, validateUpdateStaff } = require('../validators/staffValidator')

router.route('/')
  .get(protect, adminOnly, getStaff)
  .post(protect, adminOnly, validate(validateCreateStaff), createStaff)

router.route('/:id')
  .get(protect, adminOnly, getStaffMember)
  .put(protect, adminOnly, validate(validateUpdateStaff), updateStaff)
  .delete(protect, adminOnly, deleteStaff)

module.exports = router
