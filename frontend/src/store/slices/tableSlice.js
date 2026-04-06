import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  tables: [],
  loading: false,
  error: null,
  selectedFloor: 1,
}

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = action.payload
    },
    addTable: (state, action) => {
      state.tables.push(action.payload)
    },
    updateTable: (state, action) => {
      const index = state.tables.findIndex(t => t._id === action.payload._id)
      if (index !== -1) state.tables[index] = action.payload
    },
    deleteTable: (state, action) => {
      state.tables = state.tables.filter(t => t._id !== action.payload)
    },
    setTableStatus: (state, action) => {
      const table = state.tables.find(t => t._id === action.payload.id)
      if (table) table.status = action.payload.status
    },
    setSelectedFloor: (state, action) => {
      state.selectedFloor = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setTables, addTable, updateTable, deleteTable, setTableStatus, setSelectedFloor, setLoading } = tableSlice.actions
export default tableSlice.reducer
