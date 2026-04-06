const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    message = 'Không tìm thấy dữ liệu'
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field} đã tồn tại`
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map(e => e.message).join(', ')
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}

const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy: ${req.originalUrl}`)
  res.status(404)
  next(error)
}

module.exports = { errorHandler, notFound }
