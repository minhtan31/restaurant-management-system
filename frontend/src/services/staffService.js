import axiosRestaurant from '../api/axiosRestaurant'

const staffService = {
  getAll: async (params = {}) => {
    const response = await axiosRestaurant.get('/staff', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosRestaurant.get(`/staff/${id}`)
    return response.data
  },

  create: async (staffData) => {
    const response = await axiosRestaurant.post('/staff', staffData)
    return response.data
  },

  update: async (id, staffData) => {
    const response = await axiosRestaurant.put(`/staff/${id}`, staffData)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosRestaurant.delete(`/staff/${id}`)
    return response.data
  },
}

export default staffService
