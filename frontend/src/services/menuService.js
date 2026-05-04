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
    const formData = new FormData()
    formData.append('name', menuItem.name)
    formData.append('price', menuItem.price)
    formData.append('category', menuItem.category)
    if (menuItem.description) formData.append('description', menuItem.description)
    if (menuItem.available !== undefined) formData.append('available', menuItem.available)
    if (menuItem.image instanceof File) {
      formData.append('image', menuItem.image)
    }

    const response = await axiosRestaurant.post('/menu', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id, menuItem) => {
    const formData = new FormData()
    if (menuItem.name !== undefined) formData.append('name', menuItem.name)
    if (menuItem.price !== undefined) formData.append('price', menuItem.price)
    if (menuItem.category !== undefined) formData.append('category', menuItem.category)
    if (menuItem.description !== undefined) formData.append('description', menuItem.description)
    if (menuItem.available !== undefined) formData.append('available', menuItem.available)
    if (menuItem.image instanceof File) {
      formData.append('image', menuItem.image)
    }

    const response = await axiosRestaurant.put(`/menu/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  delete: async (id) => {
    const response = await axiosRestaurant.delete(`/menu/${id}`)
    return response.data
  },
}

export default menuService
