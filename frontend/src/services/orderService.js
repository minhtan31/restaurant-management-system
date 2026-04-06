import axiosRestaurant from '../api/axiosRestaurant'

const orderService = {
  getAll: async (params = {}) => {
    const response = await axiosRestaurant.get('/orders', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosRestaurant.get(`/orders/${id}`)
    return response.data
  },

  create: async (orderData) => {
    const response = await axiosRestaurant.post('/orders', orderData)
    return response.data
  },

  update: async (id, orderData) => {
    const response = await axiosRestaurant.put(`/orders/${id}`, orderData)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await axiosRestaurant.patch(`/orders/${id}/status`, { status })
    return response.data
  },

  delete: async (id) => {
    const response = await axiosRestaurant.delete(`/orders/${id}`)
    return response.data
  },

  pay: async (id, discount = 0, paymentMethod = 'cash') => {
    const response = await axiosRestaurant.post(`/orders/${id}/pay`, { discount, paymentMethod })
    return response.data
  },

  addItems: async (id, items) => {
    const response = await axiosRestaurant.post(`/orders/${id}/items`, { items })
    return response.data
  },

  getActiveByTable: async (tableNumber) => {
    const response = await axiosRestaurant.get('/orders', {
      params: { tableNumber, status: 'preparing' },
    })
    // Also check serving status
    const response2 = await axiosRestaurant.get('/orders', {
      params: { tableNumber, status: 'serving' },
    })
    const allActive = [...response.data, ...response2.data]
    return allActive.length > 0 ? allActive[0] : null
  },

  getRevenueReport: async (params = {}) => {
    const response = await axiosRestaurant.get('/orders/reports/revenue', { params })
    return response.data
  },
}

export default orderService
