import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Tooltip, Divider, InputAdornment,
} from '@mui/material'
import {
  Add as AddIcon, Visibility as ViewIcon,
  CheckCircle as CompleteIcon, LocalShipping as ServingIcon,
  Schedule as PrepareIcon, Delete as DeleteIcon,
  Search as SearchIcon, Print as PrintIcon,
  Payment as PaymentIcon, Edit as EditIcon,
  AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material'
import { setOrders, addOrder, updateOrder, deleteOrder, setLoading } from '../../store/slices/orderSlice'
import { setTables } from '../../store/slices/tableSlice'
import { setMenuItems } from '../../store/slices/menuSlice'
import orderService from '../../services/orderService'
import tableService from '../../services/tableService'
import menuService from '../../services/menuService'

const statusConfig = {
  preparing: { label: 'Đang chuẩn bị', color: '#F59E0B', icon: <PrepareIcon sx={{ fontSize: 16 }} /> },
  serving: { label: 'Đang phục vụ', color: '#3B82F6', icon: <ServingIcon sx={{ fontSize: 16 }} /> },
  completed: { label: 'Hoàn thành', color: '#22C55E', icon: <CompleteIcon sx={{ fontSize: 16 }} /> },
}

const Orders = () => {
  const dispatch = useDispatch()
  const { orders } = useSelector(state => state.order)
  const { items: menuItems } = useSelector(state => state.menu)
  const { tables } = useSelector(state => state.table)
  const { user } = useSelector(state => state.auth)
  const isAdmin = user?.role === 'admin'
  const [openCreate, setOpenCreate] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newOrder, setNewOrder] = useState({ tableNumber: '', items: [] })
  const [selectedMenuItem, setSelectedMenuItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [itemNotes, setItemNotes] = useState('')
  const [openEdit, setOpenEdit] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  const [addingItems, setAddingItems] = useState([])
  const [editSelectedMenuItem, setEditSelectedMenuItem] = useState('')
  const [editQuantity, setEditQuantity] = useState(1)
  const [editItemNotes, setEditItemNotes] = useState('')
  const [openPayment, setOpenPayment] = useState(false)
  const [payOrder, setPayOrderData] = useState(null)
  const [payDiscount, setPayDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  
  const [openReturn, setOpenReturn] = useState(false)
  const [returnOrder, setReturnOrder] = useState(null)
  const [returnItems, setReturnItems] = useState({}) 

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true))
        const [orderData, tableData, menuData] = await Promise.all([
          orderService.getAll(),
          tables.length === 0 ? tableService.getAll() : Promise.resolve(null),
          menuItems.length === 0 ? menuService.getAll() : Promise.resolve(null),
        ])
        dispatch(setOrders(orderData))
        if (tableData) dispatch(setTables(tableData))
        if (menuData) dispatch(setMenuItems(menuData))
      } catch (error) { console.error('Error fetching data:', error) }
      finally { dispatch(setLoading(false)) }
    }
    fetchData()
  }, [dispatch])

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch = o.tableNumber?.toString().includes(searchTerm) || o._id?.includes(searchTerm)
    return matchStatus && matchSearch
  })

  const handleAddItem = () => {
    const item = menuItems.find(m => m._id === selectedMenuItem)
    if (!item) return
    const existing = newOrder.items.find(i => i.menuItem.name === item.name)
    if (existing) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(i =>
          i.menuItem.name === item.name
            ? { ...i, quantity: i.quantity + quantity, notes: itemNotes || i.notes }
            : i
        )
      })
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { menuItem: { _id: item._id, name: item.name, price: item.price }, quantity, notes: itemNotes }]
      })
    }
    setSelectedMenuItem('')
    setQuantity(1)
    setItemNotes('')
  }

  const handleCreateOrder = async () => {
    try {
      const created = await orderService.create({ tableNumber: parseInt(newOrder.tableNumber), items: newOrder.items, status: 'preparing' })
      dispatch(addOrder(created))
      const updatedTables = await tableService.getAll()
      dispatch(setTables(updatedTables))
      setOpenCreate(false)
      setNewOrder({ tableNumber: '', items: [] })
    } catch (error) { alert(error.response?.data?.message || 'Lỗi khi tạo đơn hàng') }
  }

  const handleStatusChange = async (id, newStatus) => {
    try { const updated = await orderService.updateStatus(id, newStatus); dispatch(updateOrder(updated)) }
    catch (error) { alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái') }
  }

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert('Chỉ quản trị viên mới có thể xóa hóa đơn!')
      return
    }
    if (!window.confirm('Bạn chắc chắn muốn xóa hóa đơn này?')) return
    try { 
      await orderService.delete(id)
      dispatch(deleteOrder(id))
      const updatedTables = await tableService.getAll()
      dispatch(setTables(updatedTables))
    }
    catch (error) { alert(error.response?.data?.message || 'Lỗi khi xóa đơn hàng') }
  }

  const handleView = (order) => { setSelectedOrder(order); setOpenView(true) }

  const handleOpenEdit = (order) => { setEditOrder(order); setAddingItems([]); setEditSelectedMenuItem(''); setEditQuantity(1); setEditItemNotes(''); setOpenEdit(true) }

  const handleAddItemToEdit = () => {
    const item = menuItems.find(m => m._id === editSelectedMenuItem)
    if (!item) return
    const existing = addingItems.find(i => i.menuItem.name === item.name)
    if (existing) {
      setAddingItems(addingItems.map(i =>
        i.menuItem.name === item.name
          ? { ...i, quantity: i.quantity + editQuantity, notes: editItemNotes || i.notes }
          : i
      ))
    } else {
      setAddingItems([...addingItems, { menuItem: { _id: item._id, name: item.name, price: item.price }, quantity: editQuantity, notes: editItemNotes }])
    }
    setEditSelectedMenuItem('')
    setEditQuantity(1)
    setEditItemNotes('')
  }

  const handleSubmitEditItems = async () => {
    if (addingItems.length === 0 || !editOrder) return
    try { const updated = await orderService.addItems(editOrder._id, addingItems); dispatch(updateOrder(updated)); setEditOrder(updated); setAddingItems([]) }
    catch (error) { alert(error.response?.data?.message || 'Lỗi khi thêm món') }
  }

  const handleOpenPayment = (order) => { setPayOrderData(order); setPayDiscount(0); setPaymentMethod('cash'); setOpenPayment(true) }

  const handleOpenReturn = (order) => {
    setReturnOrder(order)
    setReturnItems({})
    setOpenReturn(true)
  }

  const handleSetReturnQty = (itemIndex, qty) => {
    const maxQty = returnOrder?.items[itemIndex]?.quantity || 0
    const newQty = Math.max(0, Math.min(parseInt(qty) || 0, maxQty))
    
    if (newQty === 0) {
      const newItems = { ...returnItems }
      delete newItems[itemIndex]
      setReturnItems(newItems)
    } else {
      setReturnItems({ ...returnItems, [itemIndex]: newQty })
    }
  }

  const handlePaySubmit = async () => {
    if (!payOrder) return
    try {
      const updated = await orderService.pay(payOrder._id, payDiscount, paymentMethod)
      dispatch(updateOrder(updated))
      const updatedTables = await tableService.getAll()
      dispatch(setTables(updatedTables))
      setOpenPayment(false)
      setOpenView(false)
    } catch (error) { alert(error.response?.data?.message || 'Lỗi khi thanh toán') }
  }

  const handleProcessReturn = async () => {
    const returnIndices = Object.keys(returnItems).map(Number)
    if (!returnOrder || returnIndices.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món để hoàn trả')
      return
    }

    // Tính tiền hoàn trả
    let refundAmount = 0
    const returnedItemDetails = []
    
    returnIndices.forEach(idx => {
      const item = returnOrder.items[idx]
      const returnQty = returnItems[idx]
      if (item && returnQty > 0) {
        const itemRefund = (item.menuItem?.price || 0) * returnQty
        refundAmount += itemRefund
        returnedItemDetails.push(`${item.menuItem?.name} x${returnQty}`)
      }
    })

    // Tạo mảng items mới (giảm số lượng hoặc xóa các items được hoàn trả)
    const remainingItems = returnOrder.items.map((item, idx) => {
      if (returnItems[idx]) {
        const returnQty = returnItems[idx]
        const newQty = item.quantity - returnQty
        if (newQty > 0) {
          return { ...item, quantity: newQty }
        }
        return null
      }
      return item
    }).filter(item => item !== null)

    // Tính tiền thanh toán sau hoàn trả
    const originalTotal = returnOrder.totalAmount || 0
    const finalRefund = refundAmount * (1 - payDiscount / 100)
    const newTotal = Math.max(0, originalTotal - finalRefund)

    try {
      // Cập nhật hóa đơn: giảm items được hoàn trả
      const updatedOrder = await orderService.update(returnOrder._id, {
        items: remainingItems,
        status: remainingItems.length === 0 ? 'completed' : returnOrder.status
      })
      
      // Cập nhật Redux store
      dispatch(updateOrder(updatedOrder))
      
      // Thông báo thành công
      alert(
        `✅ HOÀN TRẢ THÀNH CÔNG\n\n` +
        `Món hoàn trả:\n${returnedItemDetails.join('\n')}\n\n` +
        `Tiền hàng hoàn: ${refundAmount.toLocaleString('vi-VN')}đ\n` +
        `Tiền hoàn khách: ${finalRefund.toLocaleString('vi-VN')}đ\n` +
        `Tổng còn phải trả: ${newTotal.toLocaleString('vi-VN')}đ\n\n` +
        `🧾 Ghi chú: Hóa đơn đã được cập nhật.`
      )
      
      setOpenReturn(false)
      setOpenPayment(false)
      setOpenView(false)
      setSelectedOrder(updatedOrder)
    } catch (error) {
      alert('❌ Lỗi khi hoàn trả: ' + (error.response?.data?.message || error.message))
    }
  }

return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B' }}>Đơn hàng</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Quản lý đơn hàng nhà hàng</Typography>
        </Box>
        {isAdmin && <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)} className="shimmer-btn">Tạo đơn mới</Button>}
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Tất cả', count: orders.length, color: '#64748B', filterVal: 'all' },
          { label: 'Đang chuẩn bị', count: orders.filter(o => o.status === 'preparing').length, color: '#F59E0B', filterVal: 'preparing' },
          { label: 'Đang phục vụ', count: orders.filter(o => o.status === 'serving').length, color: '#3B82F6', filterVal: 'serving' },
          { label: 'Hoàn thành', count: orders.filter(o => o.status === 'completed').length, color: '#22C55E', filterVal: 'completed' },
        ].map(stat => (
          <Grid item xs={6} sm={3} key={stat.filterVal}>
            <Card onClick={() => setFilterStatus(stat.filterVal)}
              sx={{ cursor: 'pointer', border: filterStatus === stat.filterVal ? `1.5px solid ${stat.color}30` : '1.5px solid transparent',
                background: filterStatus === stat.filterVal ? `${stat.color}04` : undefined,
                '&:hover': { transform: 'translateY(-2px)', border: `1.5px solid ${stat.color}25` } }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>{stat.label}</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: stat.color }}>{stat.count}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TextField placeholder="Tìm theo bàn hoặc mã đơn..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} sx={{ mb: 3, minWidth: 300 }} size="small"
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow>
            <TableCell>Mã đơn</TableCell><TableCell>Bàn</TableCell><TableCell>Món ăn</TableCell>
            <TableCell align="right">Tổng tiền</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thời gian</TableCell><TableCell align="center">Thao tác</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filteredOrders.map((order, index) => {
              const config = statusConfig[order.status]
              return (
                <TableRow key={order._id} sx={{ animation: `fadeIn 0.3s ease-out ${index * 0.03}s both` }}>
                  <TableCell><Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', color: '#334155' }}>#{order._id?.slice(-6)}</Typography></TableCell>
                  <TableCell><Chip label={`Bàn ${order.tableNumber}`} size="small" sx={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontWeight: 600 }} /></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#64748B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.items?.map(i => `${i.menuItem?.name || 'N/A'} x${i.quantity}`).join(', ')}
                  </Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={700} sx={{ color: '#FF6B35' }}>{(order.totalAmount || 0).toLocaleString('vi-VN')} đ</Typography></TableCell>
                  <TableCell><Chip icon={config?.icon} label={config?.label} size="small"
                    sx={{ background: `${config?.color}08`, color: config?.color, fontWeight: 600, border: `1px solid ${config?.color}15`, '& .MuiChip-icon': { color: config?.color } }} /></TableCell>
                  <TableCell><Typography variant="caption" sx={{ color: '#94A3B8' }}>{new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Typography></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Xem"><IconButton size="small" onClick={() => handleView(order)} sx={{ color: '#3B82F6' }}><ViewIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      {(order.status === 'preparing' || order.status === 'serving') && <Tooltip title="Thêm món"><IconButton size="small" onClick={() => handleOpenEdit(order)} sx={{ color: '#F59E0B' }}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
                      {order.status === 'preparing' && <Tooltip title="Phục vụ"><IconButton size="small" onClick={() => handleStatusChange(order._id, 'serving')} sx={{ color: '#4ECDC4' }}><ServingIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
                      {isAdmin && order.status === 'serving' && <Tooltip title="Thanh toán"><IconButton size="small" onClick={() => handleOpenPayment(order)} sx={{ color: '#22C55E' }}><PaymentIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
                      {isAdmin && <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleDelete(order._id)} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredOrders.length === 0 && <Box sx={{ textAlign: 'center', py: 6 }}><Typography sx={{ color: '#94A3B8' }}>Không có đơn hàng</Typography></Box>}

      {/* Create order dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Tạo đơn hàng mới</DialogTitle>
        <DialogContent>
          <TextField fullWidth select label="Chọn bàn" value={newOrder.tableNumber} onChange={e => setNewOrder({ ...newOrder, tableNumber: e.target.value })} sx={{ mb: 2, mt: 1 }}>
            {tables.filter(t => t.status !== 'occupied').map(t => <MenuItem key={t._id} value={t.number}>Bàn {t.number} ({t.seats} chỗ)</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField select label="Chọn món" value={selectedMenuItem} onChange={e => setSelectedMenuItem(e.target.value)} sx={{ flex: 1 }}>
              {menuItems.filter(m => m.available).map(m => <MenuItem key={m._id} value={m._id}>{m.name} - {m.price?.toLocaleString('vi-VN')}đ</MenuItem>)}
            </TextField>
            <TextField label="SL" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} sx={{ width: 80 }} />
            <Button variant="outlined" onClick={handleAddItem} sx={{ borderColor: '#FF6B35', color: '#FF6B35' }}>+</Button>
          </Box>
          <TextField fullWidth label="Ghi chú (tuỳ chọn)" placeholder="Ví dụ: Không cay, ít muối..." value={itemNotes} onChange={e => setItemNotes(e.target.value)} sx={{ mb: 2 }} size="small" />
          {newOrder.items.length > 0 && (
            <Box sx={{ p: 2, borderRadius: 3, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.05)' }}>
              {newOrder.items.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{item.menuItem.name} x{item.quantity}</Typography>
                    {item.notes && <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>📝 {item.notes}</Typography>}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{(item.menuItem.price * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                    <IconButton size="small" onClick={() => setNewOrder({ ...newOrder, items: newOrder.items.filter((_, idx) => idx !== i) })} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Tổng cộng:</Typography>
                <Typography fontWeight={700} sx={{ color: '#FF6B35' }}>{newOrder.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0).toLocaleString('vi-VN')}đ</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateOrder} disabled={!newOrder.tableNumber || newOrder.items.length === 0} className="shimmer-btn">Tạo đơn</Button>
        </DialogActions>
      </Dialog>

      {/* View order dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        {selectedOrder && (<>
          <DialogTitle sx={{ fontWeight: 700 }}>Chi tiết đơn #{selectedOrder._id?.slice(-6)}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip label={`Bàn ${selectedOrder.tableNumber}`} sx={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6' }} />
              <Chip label={statusConfig[selectedOrder.status]?.label} sx={{ background: `${statusConfig[selectedOrder.status]?.color}08`, color: statusConfig[selectedOrder.status]?.color }} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {selectedOrder.items?.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{item.menuItem?.name || 'N/A'} x{item.quantity}</Typography>
                  {item.notes && <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>📝 {item.notes}</Typography>}
                </Box>
                <Typography variant="body2" fontWeight={600}>{((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>Thành tiền:</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#FF6B35' }}>{(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, display: 'block' }}>
              Nhân viên: {selectedOrder.createdBy} | {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
            <Button startIcon={<PrintIcon />} sx={{ color: '#94A3B8' }}>In hóa đơn</Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isAdmin && selectedOrder.status === 'serving' && <Button variant="contained" startIcon={<PaymentIcon />} onClick={() => { setOpenView(false); handleOpenPayment(selectedOrder) }} className="shimmer-btn" sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>Thanh toán</Button>}
              <Button variant="contained" onClick={() => setOpenView(false)}>Đóng</Button>
            </Box>
          </DialogActions>
        </>)}
      </Dialog>

      {/* Edit order dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        {editOrder && (<>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><EditIcon sx={{ color: '#F59E0B' }} />Thêm món - Đơn #{editOrder._id?.slice(-6)}</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#1E293B' }}>Món hiện tại:</Typography>
            <Box sx={{ p: 2, borderRadius: 3, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.05)', mb: 2 }}>
              {editOrder.items?.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{item.menuItem?.name} x{item.quantity}</Typography>
                    {item.notes && <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>📝 {item.notes}</Typography>}
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography fontWeight={700}>Tổng:</Typography><Typography fontWeight={700} sx={{ color: '#FF6B35' }}>{(editOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</Typography></Box>
            </Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#1E293B' }}>Thêm món mới:</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField select label="Chọn món" value={editSelectedMenuItem} onChange={e => setEditSelectedMenuItem(e.target.value)} sx={{ flex: 1 }} size="small">
                {menuItems.filter(m => m.available).map(m => <MenuItem key={m._id} value={m._id}>{m.name} - {m.price?.toLocaleString('vi-VN')}đ</MenuItem>)}
              </TextField>
              <TextField label="SL" type="number" value={editQuantity} onChange={e => setEditQuantity(parseInt(e.target.value) || 1)} sx={{ width: 70 }} size="small" />
              <Button variant="outlined" onClick={handleAddItemToEdit} disabled={!editSelectedMenuItem} sx={{ borderColor: '#4ECDC4', color: '#4ECDC4', minWidth: 'auto', px: 2 }}><AddCircleIcon /></Button>
            </Box>
            <TextField fullWidth label="Ghi chú (tuỳ chọn)" placeholder="Ví dụ: Không cay, không tỏi..." value={editItemNotes} onChange={e => setEditItemNotes(e.target.value)} sx={{ mb: 1 }} size="small" />
            {addingItems.length > 0 && (
              <Box sx={{ p: 1.5, borderRadius: 3, background: 'rgba(78,205,196,0.04)', border: '1px solid rgba(78,205,196,0.12)' }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#3BAEA7', display: 'block', mb: 0.5 }}>Món thêm (chưa gửi):</Typography>
                {addingItems.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 0.3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{item.menuItem.name} x{item.quantity}</Typography>
                      {item.notes && <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic' }}>📝 {item.notes}</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{(item.menuItem.price * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                      <IconButton size="small" onClick={() => setAddingItems(addingItems.filter((_, idx) => idx !== i))} sx={{ color: '#EF4444' }}><RemoveCircleIcon sx={{ fontSize: 14 }} /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEdit(false)} sx={{ color: '#94A3B8' }}>Đóng</Button>
            <Button variant="contained" onClick={handleSubmitEditItems} disabled={addingItems.length === 0} className="shimmer-btn" sx={{ background: 'linear-gradient(135deg, #4ECDC4, #3BAEA7)' }}>Gửi thêm món cho bếp</Button>
          </DialogActions>
        </>)}
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={openPayment} onClose={() => setOpenPayment(false)} maxWidth="xs" fullWidth>
        {payOrder && (<>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><PaymentIcon sx={{ color: '#22C55E' }} />Thanh toán - Bàn {payOrder.tableNumber}</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, borderRadius: 3, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.05)', mb: 2, mt: 1 }}>
              {payOrder.items?.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 0.3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{item.menuItem?.name} x{item.quantity}</Typography>
                    {item.notes && <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>📝 {item.notes}</Typography>}
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography fontWeight={700}>Tổng tiền:</Typography><Typography fontWeight={700}>{(payOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</Typography></Box>
            </Box>
            <TextField fullWidth label="Giảm giá (%)" type="number" value={payDiscount} onChange={e => setPayDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} sx={{ mb: 2 }} size="small" inputProps={{ min: 0, max: 100 }} />
            <TextField fullWidth select label="Phương thức thanh toán" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} sx={{ mb: 2 }} size="small">
              <MenuItem value="cash">💵 Tiền mặt</MenuItem><MenuItem value="transfer">🏦 Chuyển khoản</MenuItem><MenuItem value="card">💳 Thẻ</MenuItem>
            </TextField>
            <Box sx={{ p: 2.5, borderRadius: 3, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>Tổng tiền:</Typography><Typography variant="body2">{(payOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</Typography>
              </Box>
              {payDiscount > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>Giảm giá ({payDiscount}%):</Typography>
                <Typography variant="body2" sx={{ color: '#EF4444' }}>-{((payOrder.totalAmount || 0) * payDiscount / 100).toLocaleString('vi-VN')}đ</Typography>
              </Box>}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={800}>Thành tiền:</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#22C55E' }}>{((payOrder.totalAmount || 0) * (1 - payDiscount / 100)).toLocaleString('vi-VN')}đ</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPayment(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
           {/* <Button variant="outlined" onClick={() => { setOpenPayment(false); handleOpenReturn(payOrder) }} sx={{ borderColor: '#F59E0B', color: '#F59E0B' }}>📦 Hoàn trả</Button>*/}
            <Button variant="contained" onClick={handlePaySubmit} className="shimmer-btn" sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>Xác nhận thanh toán</Button>
          </DialogActions>
        </>)}
      </Dialog>

      {/* Return items dialog */}
      <Dialog open={openReturn} onClose={() => setOpenReturn(false)} maxWidth="sm" fullWidth>
        {returnOrder && (<>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>📦 Hoàn trả hàng - Bàn {returnOrder.tableNumber}</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#1E293B' }}>Nhập số lượng cần hoàn trả:</Typography>
            {returnOrder.items?.map((item, i) => (
              <Box key={i} sx={{
                p: 1.5, mb: 1.5, borderRadius: 2,
                border: returnItems[i] ? '2px solid #F59E0B' : '1px solid rgba(0,0,0,0.08)',
                background: returnItems[i] ? 'rgba(245,158,11,0.05)' : '#FAFBFC',
                transition: 'all 0.2s ease'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B' }}>
                      {item.menuItem?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Giá: {item.menuItem?.price?.toLocaleString('vi-VN')}đ/cái
                    </Typography>
                  </Box>
                  {item.notes && (
                    <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                      📝 {item.notes}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', minWidth: '80px' }}>
                    Có: {item.quantity} cái
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={returnItems[i] || ''}
                    onChange={(e) => handleSetReturnQty(i, e.target.value)}
                    inputProps={{ min: 0, max: item.quantity }}
                    placeholder="Nhập SL"
                    sx={{ width: 100 }}
                  />
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>cái</Typography>
                </Box>
                {returnItems[i] && (
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#F59E0B', display: 'block', mt: 0.5 }}>
                    💰 Hoàn: {((item.menuItem?.price || 0) * returnItems[i]).toLocaleString('vi-VN')}đ
                  </Typography>
                )}
              </Box>
            ))}
            
            {Object.keys(returnItems).length > 0 && Object.values(returnItems).some(v => v > 0) && (
              <Box sx={{ p: 2, mt: 2, borderRadius: 2, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', display: 'block', mb: 1 }}>TÍNH TOÁN HOÀN TRẢ:</Typography>
                {Object.entries(returnItems).map(([idx, qty]) => {
                  if(qty <= 0) return null
                  const item = returnOrder.items[idx]
                  const amount = (item.menuItem?.price || 0) * qty
                  return (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', mb: 0.5 }}>
                      <Typography variant="caption">{item.menuItem?.name} x{qty}</Typography>
                      <Typography variant="caption" fontWeight={600}>{amount.toLocaleString('vi-VN')}đ</Typography>
                    </Box>
                  )
                })}
                <Divider sx={{ my: 0.8 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={700}>Tổng hoàn hàng:</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B' }}>
                    {Object.entries(returnItems).reduce((sum, [idx, qty]) => {
                      if(qty <= 0) return sum
                      const item = returnOrder.items[idx]
                      return sum + (item.menuItem?.price || 0) * qty
                    }, 0).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
                {payDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Sau giảm giá ({payDiscount}%):</Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#22C55E' }}>
                      {(Object.entries(returnItems).reduce((sum, [idx, qty]) => {
                        if(qty <= 0) return sum
                        const item = returnOrder.items[idx]
                        return sum + (item.menuItem?.price || 0) * qty
                      }, 0) * (1 - payDiscount / 100)).toLocaleString('vi-VN')}đ
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
              Nhập số lượng cần hoàn trả
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setOpenReturn(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
              <Button 
                variant="contained" 
                onClick={handleProcessReturn} 
                disabled={!Object.values(returnItems).some(v => v > 0)}
                sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                Xử lý hoàn trả
              </Button>
            </Box>
          </DialogActions>
        </>)}
      </Dialog>
    </Box>
  )
}

export default Orders

