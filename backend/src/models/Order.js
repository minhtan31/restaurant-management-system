const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
})

const orderSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Vui lòng chọn bàn'],
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['preparing', 'serving', 'completed'],
    default: 'preparing',
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  finalAmount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: String,
    default: 'Nhân viên',
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
})

// Calculate totals before saving
orderSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  this.finalAmount = this.totalAmount * (1 - this.discount / 100)
  next()
})

module.exports = mongoose.model('Order', orderSchema)
