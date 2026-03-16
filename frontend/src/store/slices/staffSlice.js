import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  staff: [],
  loading: false,
  error: null,
}

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setStaff: (state, action) => {
      state.staff = action.payload
    },
    addStaff: (state, action) => {
      state.staff.push(action.payload)
    },
    updateStaff: (state, action) => {
      const index = state.staff.findIndex(s => s._id === action.payload._id)
      if (index !== -1) state.staff[index] = action.payload
    },
    deleteStaff: (state, action) => {
      state.staff = state.staff.filter(s => s._id !== action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setStaff, addStaff, updateStaff, deleteStaff, setLoading } = staffSlice.actions
export default staffSlice.reducer
