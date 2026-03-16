const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên món'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn loại món'],
    enum: ['Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('MenuItem', menuItemSchema)
