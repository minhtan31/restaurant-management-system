import axiosRestaurant from '../api/axiosRestaurant'

const authService = {
  login: async (credentials) => {
    const response = await axiosRestaurant.post('/auth/login', credentials)
    return response.data
  },

  register: async (userData) => {
    const response = await axiosRestaurant.post('/auth/register', userData)
    return response.data
  },

  getMe: async () => {
    const response = await axiosRestaurant.get('/auth/me')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

export default authService
