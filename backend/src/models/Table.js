const mongoose = require('mongoose')

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: [true, 'Vui lòng nhập số bàn'],
    unique: true,
  },
  seats: {
    type: Number,
    required: [true, 'Vui lòng nhập số chỗ ngồi'],
    min: 1,
    default: 4,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available',
  },
  floor: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Table', tableSchema)
