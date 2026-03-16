import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import menuSlice from './slices/menuSlice'
import orderSlice from './slices/orderSlice'
import tableSlice from './slices/tableSlice'
import staffSlice from './slices/staffSlice'

const store = configureStore({
  reducer: {
    auth: authSlice,
    menu: menuSlice,
    order: orderSlice,
    table: tableSlice,
    staff: staffSlice,
  },
})

export default store
