import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, IconButton, Tooltip, Switch, FormControlLabel,
  Divider, Badge, Avatar, Collapse,
} from '@mui/material'
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, RestaurantMenu as MenuIcon,
  AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon,
  ShoppingCart as CartIcon, TableRestaurant as TableIcon,
  Send as SendIcon, Close as CloseIcon,
  Receipt as ReceiptIcon, DeleteSweep as ClearIcon,
  EventSeat as SeatIcon, CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  AddShoppingCart as AddToOrderIcon,
} from '@mui/icons-material'
import { addMenuItem, updateMenuItem, deleteMenuItem, setSearchTerm, setSelectedCategory, setMenuItems, setLoading, setError } from '../../store/slices/menuSlice'
import menuService from '../../services/menuService'
import tableService from '../../services/tableService'
import orderService from '../../services/orderService'
import ImageUpload from '../../components/ImageUpload/ImageUpload'

const categories = ['Tất cả', 'Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng']

const categoryColors = {
  'Món chính': '#FF6B35',
  'Khai vị': '#4ECDC4',
  'Đồ uống': '#3B82F6',
  'Tráng miệng': '#F59E0B',
}

const statusConfig = {
  available: { label: 'Trống', color: '#22C55E' },
  occupied: { label: 'Đang phục vụ', color: '#FF6B35' },
  reserved: { label: 'Đã đặt', color: '#F59E0B' },
}

const MenuPage = () => {
  const dispatch = useDispatch()
  const { items, searchTerm, selectedCategory } = useSelector(state => state.menu)
  const { user } = useSelector(state => state.auth)
  const isAdmin = user?.role === 'admin'

  const [openDialog, setOpenDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Món chính', description: '', image: null, available: true,
  })

  // Staff order panel state
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [tableExpanded, setTableExpanded] = useState(true)

  // Multi-table: active order for occupied tables
  const [activeOrder, setActiveOrder] = useState(null) // existing order for occupied table
  const [isAddingToExisting, setIsAddingToExisting] = useState(false) // mode: adding to existing order
  const [loadingOrder, setLoadingOrder] = useState(false)

  // Notes functionality
  const [notesDialog, setNotesDialog] = useState(false)
  const [notesItem, setNotesItem] = useState(null)
  const [itemNotesText, setItemNotesText] = useState('')
  const [itemNotes, setItemNotes] = useState({})

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        dispatch(setLoading(true))
        const data = await menuService.getAll()
        dispatch(setMenuItems(data))
        dispatch(setError(null))
      } catch (error) {
        dispatch(setError(error.message || 'Lỗi khi tải thực đơn'))
      } finally { dispatch(setLoading(false)) }
    }
    fetchMenuItems()
  }, [dispatch])

  // Fetch tables for staff
  useEffect(() => {
    if (!isAdmin) {
      const fetchTables = async () => {
        try {
          const data = await tableService.getAll()
          setTables(data)
        } catch (error) { console.error('Error fetching tables:', error) }
      }
      fetchTables()
    }
  }, [isAdmin])

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory
    return matchSearch && matchCategory
  })

  // Admin CRUD
  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({ name: item.name, price: item.price, category: item.category, description: item.description, image: null, available: item.available })
    } else {
      setEditingItem(null)
      setFormData({ name: '', price: '', category: 'Món chính', description: '', image: null, available: true })
    }
    setOpenDialog(true)
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        const updated = await menuService.update(editingItem._id, { ...formData, price: parseInt(formData.price) })
        dispatch(updateMenuItem(updated))
      } else {
        const created = await menuService.create({ ...formData, price: parseInt(formData.price) })
        dispatch(addMenuItem(created))
      }
      setOpenDialog(false)
    } catch (error) { alert(error.response?.data?.message || 'Lỗi khi lưu món ăn') }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa món này?')) {
      try { await menuService.delete(id); dispatch(deleteMenuItem(id)) }
      catch (error) { alert(error.response?.data?.message || 'Lỗi khi xóa món ăn') }
    }
  }

  // ── Table Selection with multi-table support ──
  const handleSelectTable = async (tableId) => {
    if (selectedTable === tableId) return // already selected

    const table = tables.find(t => t._id === tableId)
    if (!table) return

    setSelectedTable(tableId)
    setOrderItems([])
    setActiveOrder(null)
    setIsAddingToExisting(false)
    setTableExpanded(false) // auto-collapse after selecting

    // If table is occupied → fetch existing active order
    if (table.status === 'occupied') {
      setLoadingOrder(true)
      try {
        const existingOrder = await orderService.getActiveByTable(table.number)
        if (existingOrder) {
          setActiveOrder(existingOrder)
          setIsAddingToExisting(true)
        }
      } catch (error) {
        console.error('Error fetching active order:', error)
      } finally {
        setLoadingOrder(false)
      }
    }
  }

  // Staff: add item to cart (directly, no dialog)
  const handleAddToCart = (item) => {
    if (!item.available) return
    const existing = orderItems.find(i => i.menuItem._id === item._id)
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.menuItem._id === item._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ))
    } else {
      setOrderItems([...orderItems, {
        menuItem: { _id: item._id, name: item.name, price: item.price, image: item.image, category: item.category },
        quantity: 1,
        notes: '',
      }])
    }
  }

  const handleConfirmNotes = () => {
    if (!notesItem) return
    
    // Update notes for existing item in cart
    setOrderItems(orderItems.map(item =>
      item.menuItem._id === notesItem._id
        ? { ...item, notes: itemNotesText }
        : item
    ))
    
    setNotesDialog(false)
    setNotesItem(null)
    setItemNotesText('')
  }

  const handleIncreaseQty = (id) => {
    setOrderItems(orderItems.map(i => i.menuItem._id === id ? { ...i, quantity: i.quantity + 1 } : i))
  }

  const handleDecreaseQty = (id) => {
    const item = orderItems.find(i => i.menuItem._id === id)
    if (item && item.quantity <= 1) {
      setOrderItems(orderItems.filter(i => i.menuItem._id !== id))
      const newNotes = { ...itemNotes }
      delete newNotes[id]
      setItemNotes(newNotes)
    } else {
      setOrderItems(orderItems.map(i => i.menuItem._id === id ? { ...i, quantity: i.quantity - 1 } : i))
    }
  }

  const handleEditItemNotes = (item) => {
    setNotesItem(item.menuItem)
    setItemNotesText(item.notes || '')
    setNotesDialog(true)
  }

  const handleClearCart = () => {
    setOrderItems([])
    setItemNotes({})
  }

  const totalItems = orderItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = orderItems.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)

  // Submit: create new order OR add items to existing
  const handleSubmitOrder = async () => {
    if (!selectedTable || orderItems.length === 0) {
      alert('Vui lòng chọn bàn và thêm ít nhất 1 món')
      return
    }
    const table = tables.find(t => t._id === selectedTable)
    if (!table) return

    try {
      if (isAddingToExisting && activeOrder) {
        // Add items to existing active order
        const updated = await orderService.addItems(activeOrder._id, orderItems)
        setActiveOrder(updated)
        alert(`Đã thêm ${totalItems} món vào đơn Bàn ${table.number}!`)
      } else {
        // Create new order
        await orderService.create({
          tableNumber: table.number,
          items: orderItems,
          status: 'preparing',
        })
        alert(`Đặt món thành công — Bàn ${table.number}!`)
      }

      setOrderItems([])
      setSelectedTable('')
      setActiveOrder(null)
      setIsAddingToExisting(false)
      setTableExpanded(true) // re-open table selector
      setItemNotes({}) // Clear all notes

      // Refresh tables
      const data = await tableService.getAll()
      setTables(data)
    } catch (error) { alert(error.response?.data?.message || 'Lỗi khi tạo đơn hàng') }
  }

  const selectedTableData = tables.find(t => t._id === selectedTable)

  const getCartQty = (itemId) => {
    const found = orderItems.find(i => i.menuItem._id === itemId)
    return found ? found.quantity : 0
  }

  // Sort tables: available first, then reserved, then occupied
  const sortedTables = [...tables].sort((a, b) => {
    const order = { available: 0, reserved: 1, occupied: 2 }
    return (order[a.status] || 3) - (order[b.status] || 3)
  })

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B' }}>Thực đơn</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {isAdmin ? `Quản lý các món ăn trong nhà hàng (${filteredItems.length} món)` : `Chọn món để đặt hàng (${filteredItems.length} món)`}
          </Typography>
        </Box>
        {isAdmin && <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} className="shimmer-btn">Thêm món</Button>}
      </Box>

      {/* Search & Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField placeholder="Tìm kiếm món ăn..." value={searchTerm} onChange={e => dispatch(setSearchTerm(e.target.value))} sx={{ minWidth: 260 }} size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <Chip key={cat} label={cat} onClick={() => dispatch(setSelectedCategory(cat))}
              sx={{
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s ease',
                background: selectedCategory === cat ? `${categoryColors[cat] || '#FF6B35'}12` : '#F1F5F9',
                color: selectedCategory === cat ? (categoryColors[cat] || '#FF6B35') : '#64748B',
                border: `1px solid ${selectedCategory === cat ? (categoryColors[cat] || '#FF6B35') + '30' : 'rgba(0,0,0,0.06)'}`,
                '&:hover': { background: `${categoryColors[cat] || '#FF6B35'}10`, transform: 'translateY(-1px)' },
              }} />
          ))}
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Menu Grid */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Grid container spacing={2.5}>
            {filteredItems.map((item, index) => {
              const cartQty = !isAdmin ? getCartQty(item._id) : 0
              return (
                <Grid item xs={12} sm={6} md={4} lg={!isAdmin ? 4 : 3} key={item._id}>
                  <Card
                    onClick={!isAdmin ? () => handleAddToCart(item) : undefined}
                    sx={{
                      height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
                      animation: `fadeIn 0.4s ease-out ${index * 0.04}s both`,
                      opacity: item.available ? 1 : 0.5,
                      cursor: !isAdmin && item.available ? 'pointer' : 'default',
                      border: cartQty > 0 ? '2px solid #FF6B35' : '1.5px solid transparent',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: item.available ? 'translateY(-4px)' : 'none',
                        boxShadow: item.available ? '0 12px 32px rgba(0,0,0,0.1)' : 'none',
                      },
                      '&:hover .menu-actions': { opacity: 1 },
                      '&:hover .food-img': { transform: 'scale(1.05)' },
                    }}
                  >
                    {cartQty > 0 && (
                      <Box sx={{
                        position: 'absolute', top: -8, right: -8, zIndex: 2,
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#FF6B35', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.75rem',
                        boxShadow: '0 2px 8px rgba(255,107,53,0.5)',
                        border: '2px solid #fff',
                      }}>
                        {cartQty}
                      </Box>
                    )}

                    <Box sx={{ height: 160, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0', background: '#F1F5F9' }}>
                      {item.image ? (
                        <Box component="img" className="food-img" src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.name}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback-emoji').style.display = 'flex' }}
                        />
                      ) : null}
                      <Box className="fallback-emoji" sx={{
                        display: item.image ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
                        background: `linear-gradient(135deg, ${categoryColors[item.category] || '#FF6B35'}08, ${categoryColors[item.category] || '#FF6B35'}15)`, fontSize: '3rem',
                      }}>🍽️</Box>

                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)', pointerEvents: 'none' }} />

                      <Chip label={item.category} size="small"
                        sx={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                          color: categoryColors[item.category] || '#FF6B35', fontWeight: 700, fontSize: '0.6rem', height: 22,
                          border: `1px solid ${categoryColors[item.category] || '#FF6B35'}25`,
                        }} />

                      {!item.available && (
                        <Chip label="Hết món" size="small" sx={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239,68,68,0.9)', color: '#fff', fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
                      )}

                      {isAdmin && (
                        <Box className="menu-actions" sx={{ position: 'absolute', top: 10, right: 10, opacity: 0, transition: 'opacity 0.3s', display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpen(item)} sx={{ background: 'rgba(255,255,255,0.9)', color: '#3B82F6', width: 28, height: 28, '&:hover': { background: '#fff' } }}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                          <IconButton size="small" onClick={() => handleDelete(item._id)} sx={{ background: 'rgba(255,255,255,0.9)', color: '#EF4444', width: 28, height: 28, '&:hover': { background: '#fff' } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2, pb: '12px !important' }}>
                      <Typography variant="body1" fontWeight={700} sx={{ mb: 0.3, fontSize: '0.9rem', color: '#1E293B', lineHeight: 1.3 }} noWrap>{item.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '0.75rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={800} sx={{ color: '#FF6B35', fontSize: '1rem' }}>
                          {item.price?.toLocaleString('vi-VN')}đ
                        </Typography>
                        {!isAdmin && item.available && (
                          <Box sx={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: cartQty > 0 ? '#FF6B35' : 'rgba(255,107,53,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
                          }}>
                            <AddIcon sx={{ fontSize: 18, color: cartQty > 0 ? '#fff' : '#FF6B35' }} />
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          {filteredItems.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MenuIcon sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#94A3B8' }}>Không tìm thấy món ăn</Typography>
            </Box>
          )}
        </Box>

        {/* ===== ORDER PANEL — Full height ===== */}
        {!isAdmin && (
          <Box sx={{
            width: 380, minWidth: 380, flexShrink: 0,
            display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          }}>
            <Box sx={{
              display: 'flex', flexDirection: 'column',
              background: '#fff',
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}>

              {/* ── Dark Header ── */}
              <Box sx={{
                px: 2.5, py: 1.8,
                background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    background: 'rgba(255,107,53,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ReceiptIcon sx={{ color: '#FF6B35', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.2 }}>
                      {isAddingToExisting ? 'Thêm món' : 'Đơn hàng mới'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem' }}>
                      {new Date().toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {orderItems.length > 0 && (
                    <Tooltip title="Xóa tất cả">
                      <IconButton size="small" onClick={handleClearCart}
                        sx={{ color: 'rgba(255,255,255,0.35)', '&:hover': { color: '#EF4444', background: 'rgba(239,68,68,0.1)' } }}>
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {totalItems > 0 && (
                    <Badge badgeContent={totalItems} sx={{
                      '& .MuiBadge-badge': { background: '#FF6B35', color: '#fff', fontWeight: 700, fontSize: '0.7rem', minWidth: 20, height: 20 },
                    }}>
                      <CartIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                    </Badge>
                  )}
                </Box>
              </Box>

              {/* ── Table Selector (Collapsible) ── */}
              <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Box
                  onClick={() => setTableExpanded(!tableExpanded)}
                  sx={{
                    px: 2.5, py: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', userSelect: 'none',
                    '&:hover': { background: 'rgba(0,0,0,0.01)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" fontWeight={700} sx={{
                      color: '#94A3B8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Bàn phục vụ
                    </Typography>
                    {selectedTableData && (
                      <Chip
                        size="small"
                        label={`Bàn ${selectedTableData.number}`}
                        icon={<TableIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          height: 22, fontSize: '0.7rem', fontWeight: 700,
                          background: selectedTableData.status === 'occupied' ? 'rgba(255,107,53,0.08)' : 'rgba(34,197,94,0.08)',
                          color: selectedTableData.status === 'occupied' ? '#FF6B35' : '#22C55E',
                          border: `1px solid ${selectedTableData.status === 'occupied' ? 'rgba(255,107,53,0.2)' : 'rgba(34,197,94,0.2)'}`,
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    )}
                    {isAddingToExisting && (
                      <Chip size="small" label="Gọi thêm" sx={{
                        height: 20, fontSize: '0.6rem', fontWeight: 700,
                        background: 'rgba(59,130,246,0.08)', color: '#3B82F6',
                      }} />
                    )}
                  </Box>
                  {tableExpanded ? <ExpandLessIcon sx={{ fontSize: 18, color: '#94A3B8' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: '#94A3B8' }} />}
                </Box>

                <Collapse in={tableExpanded}>
                  <Box sx={{ px: 2.5, pb: 2, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    {sortedTables.map(t => {
                      const isSelected = selectedTable === t._id
                      const config = statusConfig[t.status] || statusConfig.available
                      return (
                        <Box
                          key={t._id}
                          onClick={() => handleSelectTable(t._id)}
                          sx={{
                            px: 1.2, py: 0.8,
                            borderRadius: 2,
                            border: isSelected ? `2px solid ${config.color}` : '1.5px solid rgba(0,0,0,0.06)',
                            background: isSelected ? `${config.color}08` : '#FAFBFC',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: 62, textAlign: 'center',
                            position: 'relative',
                            '&:hover': { borderColor: config.color, transform: 'translateY(-1px)' },
                          }}
                        >
                          {isSelected && (
                            <CheckIcon sx={{
                              position: 'absolute', top: -5, right: -5,
                              fontSize: 14, color: '#fff',
                              background: config.color, borderRadius: '50%',
                              border: '2px solid #fff',
                            }} />
                          )}
                          <Typography variant="body2" fontWeight={isSelected ? 700 : 600} sx={{
                            color: isSelected ? config.color : '#475569', fontSize: '0.72rem', lineHeight: 1.2,
                          }}>
                            {t.number}
                          </Typography>
                          <Box sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: config.color, mx: 'auto', mt: 0.3, opacity: 0.7,
                          }} />
                        </Box>
                      )
                    })}
                  </Box>
                </Collapse>
              </Box>

              {/* ── Active Order Info (for occupied tables) ── */}
              {isAddingToExisting && activeOrder && (
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(59,130,246,0.03)' }}>
                  <Typography variant="caption" fontWeight={700} sx={{
                    color: '#3B82F6', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.8, display: 'block',
                  }}>
                    Đơn hiện tại — #{activeOrder._id?.slice(-6)}
                  </Typography>
                  <Box sx={{ maxHeight: 100, overflowY: 'auto', '&::-webkit-scrollbar': { width: 2 }, '&::-webkit-scrollbar-thumb': { background: '#CBD5E1' } }}>
                    {activeOrder.items?.map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                          {item.menuItem?.name} ×{item.quantity}
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#475569', fontSize: '0.72rem' }}>
                          {((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, pt: 0.5, borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#3B82F6', fontSize: '0.72rem' }}>Tạm tính:</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#3B82F6', fontSize: '0.72rem' }}>
                      {(activeOrder.totalAmount || 0).toLocaleString('vi-VN')}đ
                    </Typography>
                  </Box>
                </Box>
              )}

              {loadingOrder && (
                <Box sx={{ px: 2.5, py: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Đang tải đơn hàng...</Typography>
                </Box>
              )}

              {/* ── New Items List ── */}
              <Box sx={{
                flex: 1, overflowY: 'auto', px: 2.5, py: 1.5,
                '&::-webkit-scrollbar': { width: 3 },
                '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: 2 },
              }}>
                {orderItems.length === 0 && !loadingOrder ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#F8FAFC', mx: 'auto', mb: 1.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isAddingToExisting
                        ? <AddToOrderIcon sx={{ fontSize: 24, color: '#CBD5E1' }} />
                        : <CartIcon sx={{ fontSize: 24, color: '#CBD5E1' }} />}
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                      {isAddingToExisting ? 'Thêm món mới vào đơn' : 'Chưa có món nào'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '0.68rem' }}>
                      Nhấn vào món ăn bên trái để thêm
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="caption" fontWeight={700} sx={{
                      color: '#94A3B8', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, display: 'block',
                    }}>
                      {isAddingToExisting ? `Món thêm mới (${totalItems})` : `Chi tiết đơn (${totalItems} món)`}
                    </Typography>

                    {orderItems.map((item, idx) => (
                      <Box key={item.menuItem._id} sx={{
                        py: 1.2, borderBottom: idx < orderItems.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar variant="rounded" src={item.menuItem.image ? (item.menuItem.image.startsWith('http') ? item.menuItem.image : `http://localhost:5000${item.menuItem.image}`) : undefined}
                            sx={{ width: 48, height: 48, borderRadius: 2, background: '#F1F5F9', fontSize: '1.2rem' }}>🍽️</Avatar>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B', fontSize: '0.82rem', lineHeight: 1.3 }} noWrap>
                              {item.menuItem.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                              {item.menuItem.price?.toLocaleString('vi-VN')}đ / món
                            </Typography>
                            {item.notes && (
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
                                📝 {item.notes}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{
                            display: 'flex', alignItems: 'center',
                            background: '#F8FAFC', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)',
                          }}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDecreaseQty(item.menuItem._id) }}
                              sx={{ width: 28, height: 28, borderRadius: '8px 0 0 8px', color: item.quantity <= 1 ? '#EF4444' : '#64748B' }}>
                              {item.quantity <= 1 ? <DeleteIcon sx={{ fontSize: 13 }} /> : <RemoveCircleIcon sx={{ fontSize: 13 }} />}
                            </IconButton>
                            <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, textAlign: 'center', color: '#1E293B', fontSize: '0.85rem', userSelect: 'none' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleIncreaseQty(item.menuItem._id) }}
                              sx={{ width: 28, height: 28, borderRadius: '0 8px 8px 0', color: '#64748B', '&:hover': { color: '#FF6B35' } }}>
                              <AddCircleIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Box>

                          <Typography variant="body2" fontWeight={700} sx={{ color: '#1E293B', fontSize: '0.82rem', minWidth: 62, textAlign: 'right' }}>
                            {(item.menuItem.price * item.quantity).toLocaleString('vi-VN')}đ
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                          <Button size="small" onClick={() => handleEditItemNotes(item)}
                            sx={{ fontSize: '0.65rem', color: '#3B82F6', textTransform: 'none', p: 0.3, minWidth: 'auto' }}>
                            {item.notes ? '📝 Sửa ghi chú' : '📝 Thêm ghi chú'}
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </>
                )}
              </Box>

              {/* ── Footer: Summary + Button ── */}
              {orderItems.length > 0 && (
                <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#FAFBFC' }}>
                  <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.78rem' }}>Số lượng</Typography>
                      <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.78rem' }}>{totalItems} món</Typography>
                    </Box>
                    {selectedTableData && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.78rem' }}>Bàn</Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#FF6B35', fontSize: '0.78rem' }}>Bàn {selectedTableData.number}</Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 1.2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1E293B', fontSize: '0.9rem' }}>
                        {isAddingToExisting ? 'Tiền thêm' : 'Tổng cộng'}
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#FF6B35', fontSize: '1.25rem' }}>
                        {totalAmount.toLocaleString('vi-VN')}đ
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
                    <Button
                      variant="contained" fullWidth
                      startIcon={isAddingToExisting ? <AddToOrderIcon /> : <SendIcon />}
                      onClick={handleSubmitOrder}
                      disabled={!selectedTable || orderItems.length === 0}
                      sx={{
                        py: 1.4, borderRadius: 3, fontWeight: 700, fontSize: '0.88rem', textTransform: 'none',
                        background: isAddingToExisting
                          ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                          : 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                        boxShadow: isAddingToExisting
                          ? '0 4px 16px rgba(59,130,246,0.25)'
                          : '0 4px 16px rgba(255,107,53,0.25)',
                        '&:hover': { transform: 'translateY(-1px)' },
                        '&.Mui-disabled': { background: '#E2E8F0', color: '#94A3B8', boxShadow: 'none' },
                      }}
                    >
                      {isAddingToExisting ? 'Thêm món vào đơn' : 'Gửi đơn cho bếp'}
                    </Button>
                    {!selectedTable && orderItems.length > 0 && (
                      <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', textAlign: 'center', mt: 0.8, fontSize: '0.68rem' }}>
                        ⚠️ Vui lòng chọn bàn trước khi gửi
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Notes Dialog - for adding/editing notes to items */}
      <Dialog open={notesDialog} onClose={() => { setNotesDialog(false); setNotesItem(null); setItemNotesText('') }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          📝 Ghi chú cho {notesItem?.name}
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Ghi chú (tuỳ chọn)" placeholder="Ví dụ: Không cay, ít muối..." value={itemNotesText} onChange={e => setItemNotesText(e.target.value)} sx={{ mb: 2, mt: 2 }} multiline rows={3} />
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Để trống nếu khách không có yêu cầu đặc biệt
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setNotesDialog(false); setNotesItem(null); setItemNotesText('') }} sx={{ color: '#94A3B8' }}>Hủy</Button>
          <Button variant="contained" onClick={handleConfirmNotes} className="shimmer-btn">Xác nhận</Button>
        </DialogActions>
      </Dialog>

      {/* Admin Add/Edit dialog */}
      {isAdmin && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuIcon sx={{ color: '#FF6B35' }} />{editingItem ? 'Sửa món ăn' : 'Thêm món mới'}
          </DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Tên món" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} sx={{ mb: 2, mt: 1 }} />
            <TextField fullWidth label="Giá (VNĐ)" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth select label="Loại món" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} sx={{ mb: 2 }}>
              {categories.filter(c => c !== 'Tất cả').map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Mô tả" multiline rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <ImageUpload
                value={formData.image}
                onChange={(file) => setFormData({ ...formData, image: file })}
                currentImage={editingItem?.image || ''}
                label="Hình ảnh món ăn"
              />
            </Box>
            <FormControlLabel control={<Switch checked={formData.available} onChange={e => setFormData({ ...formData, available: e.target.checked })} color="success" />} label="Còn phục vụ" />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
            <Button variant="contained" onClick={handleSave} className="shimmer-btn">{editingItem ? 'Cập nhật' : 'Thêm'}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default MenuPage
