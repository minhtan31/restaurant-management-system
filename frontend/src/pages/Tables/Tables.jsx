import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, ToggleButton, ToggleButtonGroup, Tooltip, Divider,
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  TableRestaurant as TableIcon, People as PeopleIcon,
  EventSeat as SeatIcon, Receipt as ReceiptIcon,
  Payment as PaymentIcon, AddCircle as AddCircleIcon,
} from '@mui/icons-material'
import { setTables, addTable, updateTable, deleteTable, setSelectedFloor, setLoading } from '../../store/slices/tableSlice'
import { setMenuItems } from '../../store/slices/menuSlice'
import { addOrder, updateOrder } from '../../store/slices/orderSlice'
import tableService from '../../services/tableService'
import menuService from '../../services/menuService'
import orderService from '../../services/orderService'

const statusConfig = {
  available: { label: 'Trống', color: '#22C55E', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)' },
  occupied: { label: 'Đang phục vụ', color: '#FF6B35', bg: 'rgba(255,107,53,0.06)', border: 'rgba(255,107,53,0.2)' },
  reserved: { label: 'Đã đặt trước', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
}

const Tables = () => {
  const dispatch = useDispatch()
  const { tables, selectedFloor } = useSelector(state => state.table)
  const { user } = useSelector(state => state.auth)
  const isAdmin = user?.role === 'admin'
  const { items: menuItems } = useSelector(state => state.menu)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [formData, setFormData] = useState({ number: '', seats: 4, status: 'available', floor: 1 })
  const [openOrderDialog, setOpenOrderDialog] = useState(false)
  const [orderTable, setOrderTable] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [selectedMenuItem, setSelectedMenuItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [openActiveOrder, setOpenActiveOrder] = useState(false)
  const [activeOrder, setActiveOrder] = useState(null)
  const [activeOrderLoading, setActiveOrderLoading] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)
  const [payDiscount, setPayDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true))
        const [tableData, menuData] = await Promise.all([
          tableService.getAll(),
          menuItems.length === 0 ? menuService.getAll() : Promise.resolve(null),
        ])
        dispatch(setTables(tableData))
        if (menuData) dispatch(setMenuItems(menuData))
      } catch (error) { console.error('Error fetching data:', error) }
      finally { dispatch(setLoading(false)) }
    }
    fetchData()
  }, [dispatch])

  const filteredTables = tables.filter(t => t.floor === selectedFloor)

  const handleOpen = (table = null) => {
    if (table) {
      setEditingTable(table)
      setFormData({ number: table.number, seats: table.seats, status: table.status, floor: table.floor })
    } else {
      setEditingTable(null)
      const maxNum = tables.length > 0 ? Math.max(...tables.map(t => t.number)) : 0
      setFormData({ number: maxNum + 1, seats: 4, status: 'available', floor: selectedFloor })
    }
    setOpenDialog(true)
  }

  const handleSave = async () => {
    try {
      if (editingTable) {
        const updated = await tableService.update(editingTable._id, formData)
        dispatch(updateTable(updated))
      } else {
        const created = await tableService.create(formData)
        dispatch(addTable(created))
      }
      setOpenDialog(false)
    } catch (error) { alert(error.response?.data?.message || 'Lỗi khi lưu bàn') }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bàn này?')) {
      try { await tableService.delete(id); dispatch(deleteTable(id)) }
      catch (error) { alert(error.response?.data?.message || 'Lỗi khi xóa bàn') }
    }
  }

  const handleTableClick = async (table) => {
    if (table.status === 'available' || table.status === 'reserved') {
      setOrderTable(table); setOrderItems([]); setSelectedMenuItem(''); setQuantity(1); setOpenOrderDialog(true)
    } else if (table.status === 'occupied') {
      setActiveOrderLoading(true); setOpenActiveOrder(true)
      try {
        const order = await orderService.getActiveByTable(table.number)
        setActiveOrder(order); setOrderTable(table)
      } catch (error) { console.error('Error fetching active order:', error) }
      finally { setActiveOrderLoading(false) }
    }
  }

  const handleAddItemToNewOrder = () => {
    const item = menuItems.find(m => m._id === selectedMenuItem)
    if (!item) return
    const existing = orderItems.find(i => i.menuItem.name === item.name)
    if (existing) { setOrderItems(orderItems.map(i => i.menuItem.name === item.name ? { ...i, quantity: i.quantity + quantity } : i)) }
    else { setOrderItems([...orderItems, { menuItem: { _id: item._id, name: item.name, price: item.price }, quantity }]) }
    setSelectedMenuItem(''); setQuantity(1)
  }

  const handleRemoveItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index))

  const handleCreateOrder = async () => {
    try {
      const created = await orderService.create({ tableNumber: orderTable.number, items: orderItems, status: 'preparing' })
      dispatch(addOrder(created)); dispatch(updateTable({ ...orderTable, status: 'occupied' })); setOpenOrderDialog(false)
    } catch (error) { alert(error.response?.data?.message || 'Lỗi khi tạo đơn hàng') }
  }

  const handleOpenPayment = () => { setPayDiscount(0); setPaymentMethod('cash'); setAmountReceived(0); setOpenPayment(true) }

  const handlePay = async () => {
    if (!activeOrder) return
    const finalAmount = (activeOrder.totalAmount || 0) * (1 - payDiscount / 100)
    if (paymentMethod === 'cash' && amountReceived > 0 && amountReceived < finalAmount) {
      alert('Tiền khách đưa không đủ!')
      return
    }
    try {
      const updated = await orderService.pay(activeOrder._id, payDiscount, paymentMethod, paymentMethod === 'cash' ? amountReceived : 0)
      dispatch(updateOrder(updated)); dispatch(updateTable({ ...orderTable, status: 'available' }))
      setOpenPayment(false); setOpenActiveOrder(false)
    } catch (error) { alert(error.response?.data?.message || 'Lỗi khi thanh toán') }
  }

  const stats = {
    total: filteredTables.length,
    available: filteredTables.filter(t => t.status === 'available').length,
    occupied: filteredTables.filter(t => t.status === 'occupied').length,
    reserved: filteredTables.filter(t => t.status === 'reserved').length,
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B' }}>Quản lý bàn</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Click bàn trống để tạo đơn • Click bàn đang phục vụ để xem/thêm món/thanh toán</Typography>
        </Box>
        {isAdmin && <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} className="shimmer-btn">Thêm bàn</Button>}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <ToggleButtonGroup value={selectedFloor} exclusive onChange={(_, v) => v !== null && dispatch(setSelectedFloor(v))}
          sx={{ '& .MuiToggleButton-root': { border: '1px solid rgba(0,0,0,0.08)', color: '#64748B', px: 3, fontWeight: 600,
            '&.Mui-selected': { background: 'rgba(255,107,53,0.08)', color: '#FF6B35', borderColor: 'rgba(255,107,53,0.2)' } } }}>
          <ToggleButton value={1}>Tầng 1</ToggleButton>
          <ToggleButton value={2}>Tầng 2</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Chip key={key} label={`${config.label}: ${stats[key] || 0}`}
              sx={{ background: config.bg, color: config.color, fontWeight: 600, fontSize: '0.8rem', border: `1px solid ${config.border}` }}
              icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', background: config.color, ml: 1 }} />} />
          ))}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredTables.map((table, index) => {
          const config = statusConfig[table.status]
          return (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={table._id}>
              <Card onClick={() => handleTableClick(table)}
                sx={{
                  textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${config.border}`, position: 'relative', overflow: 'visible',
                  animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                  '&:hover': { transform: 'translateY(-6px) scale(1.02)', boxShadow: `0 12px 30px ${config.color}15`, border: `1.5px solid ${config.color}55` },
                  '&:hover .table-actions': { opacity: 1 },
                  '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${config.color}, ${config.color}44, transparent)`, borderRadius: '12px 12px 0 0' },
                }}>
                {isAdmin && (
                  <Box className="table-actions" sx={{ position: 'absolute', top: 8, right: 8, opacity: 0, transition: 'opacity 0.3s', display: 'flex', gap: 0.5, zIndex: 1 }}>
                    <Tooltip title="Sửa"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpen(table) }} sx={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', width: 28, height: 28 }}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(table._id) }} sx={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', width: 28, height: 28 }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                  </Box>
                )}
                <CardContent sx={{ p: 2.5 }}>
                  <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1.5, background: `${config.color}10`, color: config.color, border: `1px solid ${config.color}25` }}>
                    <TableIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: '#1E293B' }}>Bàn {table.number}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <SeatIcon sx={{ fontSize: 14, color: '#94A3B8' }} /><Typography variant="caption" sx={{ color: '#94A3B8' }}>{table.seats} chỗ</Typography>
                  </Box>
                  <Chip label={config.label} size="small" sx={{ background: config.bg, color: config.color, fontWeight: 600, fontSize: '0.7rem', height: 24, border: `1px solid ${config.border}` }} />
                  {table.status === 'available' && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#22C55E', fontWeight: 600, opacity: 0.8 }}>👆 Click để tạo đơn</Typography>}
                  {table.status === 'occupied' && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#FF6B35', fontWeight: 600, opacity: 0.8 }}>👆 Click để xem đơn</Typography>}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Dialog Add/Edit Table */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><TableIcon sx={{ color: '#FF6B35' }} />{editingTable ? 'Sửa bàn' : 'Thêm bàn mới'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Số bàn" type="number" value={formData.number} onChange={e => setFormData({ ...formData, number: parseInt(e.target.value) || '' })} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth label="Số chỗ ngồi" type="number" value={formData.seats} onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) || 2 })} sx={{ mb: 2 }} />
          <TextField fullWidth select label="Trạng thái" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} sx={{ mb: 2 }}>
            <MenuItem value="available">Trống</MenuItem><MenuItem value="occupied">Đang phục vụ</MenuItem><MenuItem value="reserved">Đã đặt trước</MenuItem>
          </TextField>
          <TextField fullWidth select label="Tầng" value={formData.floor} onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) })}>
            <MenuItem value={1}>Tầng 1</MenuItem><MenuItem value={2}>Tầng 2</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} className="shimmer-btn">{editingTable ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Create Order */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><ReceiptIcon sx={{ color: '#FF6B35' }} />Tạo đơn - Bàn {orderTable?.number}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>Chọn món từ thực đơn để tạo đơn hàng mới</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField select label="Chọn món" value={selectedMenuItem} onChange={e => setSelectedMenuItem(e.target.value)} sx={{ flex: 1 }} size="small">
              {menuItems.filter(m => m.available).map(m => <MenuItem key={m._id} value={m._id}>{m.name} - {m.price?.toLocaleString('vi-VN')}đ</MenuItem>)}
            </TextField>
            <TextField label="SL" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} sx={{ width: 70 }} size="small" />
            <Button variant="outlined" onClick={handleAddItemToNewOrder} disabled={!selectedMenuItem} sx={{ borderColor: '#FF6B35', color: '#FF6B35', minWidth: 'auto', px: 2 }}><AddCircleIcon /></Button>
          </Box>
          {orderItems.length > 0 && (
            <Box sx={{ p: 2, borderRadius: 3, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#1E293B' }}>Món đã chọn:</Typography>
              {orderItems.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#334155' }}>{item.menuItem.name} x{item.quantity}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B' }}>{(item.menuItem.price * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                    <IconButton size="small" onClick={() => handleRemoveItem(i)} sx={{ color: '#EF4444' }}><RemoveCircleIcon sx={{ fontSize: 16 }} /></IconButton>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700} sx={{ color: '#1E293B' }}>Tổng cộng:</Typography>
                <Typography fontWeight={700} sx={{ color: '#FF6B35' }}>{orderItems.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0).toLocaleString('vi-VN')}đ</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenOrderDialog(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateOrder} disabled={orderItems.length === 0} className="shimmer-btn">Tạo đơn & Gửi bếp</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Active Order */}
      <Dialog open={openActiveOrder} onClose={() => setOpenActiveOrder(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><TableIcon sx={{ color: '#FF6B35' }} />Bàn {orderTable?.number} - Đơn đang phục vụ</DialogTitle>
        <DialogContent>
          {activeOrderLoading ? <Typography sx={{ color: '#94A3B8', py: 3, textAlign: 'center' }}>Đang tải...</Typography>
          : !activeOrder ? <Typography sx={{ color: '#94A3B8', py: 3, textAlign: 'center' }}>Không tìm thấy đơn hàng hoạt động</Typography>
          : (<>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip label={`#${activeOrder._id?.slice(-6)}`} size="small" sx={{ background: '#F1F5F9', fontWeight: 600 }} />
              <Chip label={activeOrder.status === 'preparing' ? 'Đang chuẩn bị' : 'Đang phục vụ'} size="small"
                sx={{ background: activeOrder.status === 'preparing' ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)',
                  color: activeOrder.status === 'preparing' ? '#F59E0B' : '#3B82F6', fontWeight: 600 }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#1E293B' }}>Món đã gọi:</Typography>
            <Box sx={{ p: 2, borderRadius: 3, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.05)', mb: 2 }}>
              {activeOrder.items?.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#334155' }}>{item.menuItem?.name} x{item.quantity}</Typography>
                  <Typography variant="body2" fontWeight={600}>{((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700} sx={{ color: '#1E293B' }}>Tổng:</Typography>
                <Typography fontWeight={700} sx={{ color: '#FF6B35' }}>{(activeOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', display: 'block' }}>📋 Để thêm món hoặc chỉnh sửa đơn, vui lòng vào trang Đơn hàng.</Typography>
          </>)}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenActiveOrder(false)} sx={{ color: '#94A3B8' }}>Đóng</Button>
          {activeOrder && <Button variant="contained" startIcon={<PaymentIcon />} onClick={handleOpenPayment} className="shimmer-btn"
            sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>Thanh toán</Button>}
        </DialogActions>
      </Dialog>

      {/* Dialog Payment */}
      <Dialog open={openPayment} onClose={() => setOpenPayment(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><PaymentIcon sx={{ color: '#22C55E' }} />Thanh toán - Bàn {orderTable?.number}</DialogTitle>
        <DialogContent>
          {activeOrder && (<>
            <Box sx={{ p: 2, borderRadius: 3, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.05)', mb: 2, mt: 1 }}>
              {activeOrder.items?.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                  <Typography variant="body2">{item.menuItem?.name} x{item.quantity}</Typography>
                  <Typography variant="body2" fontWeight={600}>{((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography fontWeight={700}>Tổng tiền:</Typography><Typography fontWeight={700}>{(activeOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</Typography></Box>
            </Box>
            <TextField fullWidth label="Giảm giá (%)" type="number" value={payDiscount} onChange={e => setPayDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} sx={{ mb: 2 }} size="small" inputProps={{ min: 0, max: 100 }} />
            <TextField fullWidth select label="Phương thức thanh toán" value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setAmountReceived(0) }} sx={{ mb: 2 }} size="small">
              <MenuItem value="cash">💵 Tiền mặt</MenuItem><MenuItem value="transfer">🏦 Chuyển khoản</MenuItem><MenuItem value="card">💳 Thẻ</MenuItem>
            </TextField>
            {paymentMethod === 'cash' && (
              <TextField fullWidth label="💵 Tiền khách đưa (đ)" type="number" value={amountReceived || ''}
                onChange={e => setAmountReceived(Math.max(0, parseInt(e.target.value) || 0))}
                sx={{ mb: 2 }} size="small" inputProps={{ min: 0 }}
                placeholder="Nhập số tiền khách đưa..." />
            )}
            <Box sx={{ p: 2.5, borderRadius: 3, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>Tổng tiền:</Typography>
                <Typography variant="body2">{(activeOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</Typography>
              </Box>
              {payDiscount > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>Giảm giá ({payDiscount}%):</Typography>
                <Typography variant="body2" sx={{ color: '#EF4444' }}>-{((activeOrder.totalAmount || 0) * payDiscount / 100).toLocaleString('vi-VN')}đ</Typography>
              </Box>}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#1E293B' }}>Thành tiền:</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#22C55E' }}>{((activeOrder.totalAmount || 0) * (1 - payDiscount / 100)).toLocaleString('vi-VN')}đ</Typography>
              </Box>
              {paymentMethod === 'cash' && amountReceived > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Khách đưa:</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#3B82F6' }}>{amountReceived.toLocaleString('vi-VN')}đ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderRadius: 2, background: amountReceived >= (activeOrder.totalAmount || 0) * (1 - payDiscount / 100) ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: amountReceived >= (activeOrder.totalAmount || 0) * (1 - payDiscount / 100) ? '#22C55E' : '#EF4444' }}>🔄 Tiền thối:</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: amountReceived >= (activeOrder.totalAmount || 0) * (1 - payDiscount / 100) ? '#22C55E' : '#EF4444' }}>
                      {amountReceived >= (activeOrder.totalAmount || 0) * (1 - payDiscount / 100)
                        ? (amountReceived - (activeOrder.totalAmount || 0) * (1 - payDiscount / 100)).toLocaleString('vi-VN') + 'đ'
                        : 'Chưa đủ tiền!'}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </>)}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPayment(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
          <Button variant="contained" onClick={handlePay} className="shimmer-btn" sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>Xác nhận thanh toán</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Tables
