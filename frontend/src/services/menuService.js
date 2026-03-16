import axiosRestaurant from '../api/axiosRestaurant'

const menuService = {
  getAll: async (params = {}) => {
    const response = await axiosRestaurant.get('/menu', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosRestaurant.get(`/menu/${id}`)
    return response.data
  },

  create: async (menuItem) => {
    const response = await axiosRestaurant.post('/menu', menuItem)
    return response.data
  },

  update: async (id, menuItem) => {
    const response = await axiosRestaurant.put(`/menu/${id}`, menuItem)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosRestaurant.delete(`/menu/${id}`)
    return response.data
  },
}

export default menuService
