import axiosRestaurant from '../api/axiosRestaurant'

const tableService = {
  getAll: async (params = {}) => {
    const response = await axiosRestaurant.get('/tables', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosRestaurant.get(`/tables/${id}`)
    return response.data
  },

  create: async (tableData) => {
    const response = await axiosRestaurant.post('/tables', tableData)
    return response.data
  },

  update: async (id, tableData) => {
    const response = await axiosRestaurant.put(`/tables/${id}`, tableData)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosRestaurant.delete(`/tables/${id}`)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await axiosRestaurant.patch(`/tables/${id}/status`, { status })
    return response.data
  },
}

export default tableService
