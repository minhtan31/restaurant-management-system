import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'Tất cả',
}

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action) => {
      state.items = action.payload
    },
    addMenuItem: (state, action) => {
      state.items.push(action.payload)
    },
    updateMenuItem: (state, action) => {
      const index = state.items.findIndex(i => i._id === action.payload._id)
      if (index !== -1) state.items[index] = action.payload
    },
    deleteMenuItem: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload)
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, setSearchTerm, setSelectedCategory, setLoading, setError } = menuSlice.actions
export default menuSlice.reducer
