const express = require('express')
const router = express.Router()
const {
  getTables, getTable, createTable, updateTable, deleteTable, updateTableStatus,
} = require('../controllers/tableController')
const { protect, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { validateCreateTable, validateUpdateTable, validateUpdateTableStatus } = require('../validators/tableValidator')

router.route('/')
  .get(protect, getTables)
  .post(protect, adminOnly, validate(validateCreateTable), createTable)

router.route('/:id')
  .get(protect, getTable)
  .put(protect, adminOnly, validate(validateUpdateTable), updateTable)
  .delete(protect, adminOnly, deleteTable)

router.patch('/:id/status', protect, validate(validateUpdateTableStatus), updateTableStatus)

module.exports = router
