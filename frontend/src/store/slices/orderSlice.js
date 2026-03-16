import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload)
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(o => o._id === action.payload._id)
      if (index !== -1) state.orders[index] = action.payload
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(o => o._id !== action.payload)
    },
    setOrderStatus: (state, action) => {
      const order = state.orders.find(o => o._id === action.payload.id)
      if (order) order.status = action.payload.status
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    addItemToCurrentOrder: (state, action) => {
      if (!state.currentOrder) return
      const existingItem = state.currentOrder.items.find(
        i => i.menuItem.name === action.payload.menuItem.name
      )
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.currentOrder.items.push(action.payload)
      }
    },
    removeItemFromCurrentOrder: (state, action) => {
      if (!state.currentOrder) return
      state.currentOrder.items = state.currentOrder.items.filter(
        (_, index) => index !== action.payload
      )
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const {
  setOrders, addOrder, updateOrder, deleteOrder, setOrderStatus,
  setCurrentOrder, addItemToCurrentOrder, removeItemFromCurrentOrder, setLoading,
} = orderSlice.actions
export default orderSlice.reducer
