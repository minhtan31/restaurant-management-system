import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Grid, Typography, Card, CardContent, CardMedia, Button, Chip,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, IconButton, Tooltip, Avatar, CardActions, Switch, FormControlLabel,
} from '@mui/material'
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, RestaurantMenu as MenuIcon,
  AttachMoney as MoneyIcon, Category as CategoryIcon,
} from '@mui/icons-material'
import { addMenuItem, updateMenuItem, deleteMenuItem, setSearchTerm, setSelectedCategory, setMenuItems, setLoading, setError } from '../../store/slices/menuSlice'
import menuService from '../../services/menuService'

const categories = ['Tất cả', 'Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng']

const categoryColors = {
  'Món chính': '#FF6B35',
  'Khai vị': '#4ECDC4',
  'Đồ uống': '#3B82F6',
  'Tráng miệng': '#F59E0B',
}

const foodEmojis = {
  'Món chính': '🍜',
  'Khai vị': '🥗',
  'Đồ uống': '☕',
  'Tráng miệng': '🍮',
}

const MenuPage = () => {
  const dispatch = useDispatch()
  const { items, searchTerm, selectedCategory } = useSelector(state => state.menu)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Món chính', description: '', image: '', available: true,
  })

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        dispatch(setLoading(true))
        const data = await menuService.getAll()
        dispatch(setMenuItems(data))
        dispatch(setError(null))
      } catch (error) {
        console.error('Error fetching menu items:', error)
        dispatch(setError(error.message || 'Lỗi khi tải thực đơn'))
      } finally {
        dispatch(setLoading(false))
      }
    }
    fetchMenuItems()
  }, [dispatch])

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory
    return matchSearch && matchCategory
  })

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({ name: item.name, price: item.price, category: item.category, description: item.description, image: item.image, available: item.available })
    } else {
      setEditingItem(null)
      setFormData({ name: '', price: '', category: 'Món chính', description: '', image: '', available: true })
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
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert(error.response?.data?.message || 'Lỗi khi lưu món ăn')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa món này?')) {
      try {
        await menuService.delete(id)
        dispatch(deleteMenuItem(id))
      } catch (error) {
        console.error('Error deleting menu item:', error)
        alert(error.response?.data?.message || 'Lỗi khi xóa món ăn')
      }
    }
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Thực đơn</Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các món ăn trong nhà hàng ({filteredItems.length} món)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8F65)' }}
        >
          Thêm món
        </Button>
      </Box>

      {/* Search & Category filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Tìm kiếm món ăn..."
          value={searchTerm}
          onChange={e => dispatch(setSearchTerm(e.target.value))}
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
          }}
          size="small"
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => dispatch(setSelectedCategory(cat))}
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                background: selectedCategory === cat
                  ? `linear-gradient(135deg, ${categoryColors[cat] || '#FF6B35'}22, ${categoryColors[cat] || '#FF6B35'}44)`
                  : 'rgba(148,163,184,0.05)',
                color: selectedCategory === cat
                  ? categoryColors[cat] || '#FF6B35'
                  : '#94A3B8',
                border: `1px solid ${selectedCategory === cat
                  ? (categoryColors[cat] || '#FF6B35') + '44'
                  : 'rgba(148,163,184,0.1)'}`,
                '&:hover': { background: `${categoryColors[cat] || '#FF6B35'}22` },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Menu grid */}
      <Grid container spacing={3}>
        {filteredItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                animation: `fadeIn 0.4s ease-out ${index * 0.04}s both`,
                opacity: item.available ? 1 : 0.6,
                '&:hover .menu-actions': { opacity: 1 },
              }}
            >
              {/* Food image placeholder */}
              <Box
                sx={{
                  height: 160,
                  background: `linear-gradient(135deg, ${categoryColors[item.category] || '#FF6B35'}15, ${categoryColors[item.category] || '#FF6B35'}08)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Typography sx={{ fontSize: '4rem' }}>
                  {foodEmojis[item.category] || '🍽️'}
                </Typography>

                {/* Category badge */}
                <Chip
                  label={item.category}
                  size="small"
                  sx={{
                    position: 'absolute', top: 12, left: 12,
                    background: `${categoryColors[item.category] || '#FF6B35'}22`,
                    color: categoryColors[item.category] || '#FF6B35',
                    fontWeight: 600, fontSize: '0.65rem', height: 22,
                    backdropFilter: 'blur(10px)',
                  }}
                />

                {!item.available && (
                  <Chip
                    label="Hết món"
                    size="small"
                    sx={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(239,68,68,0.2)', color: '#EF4444',
                      fontWeight: 600, fontSize: '0.65rem', height: 22,
                    }}
                  />
                )}

                {/* Hover actions */}
                <Box
                  className="menu-actions"
                  sx={{
                    position: 'absolute', top: 12, right: 12,
                    opacity: 0, transition: 'opacity 0.2s', display: 'flex', gap: 0.5,
                  }}
                >
                  <IconButton size="small" onClick={() => handleOpen(item)}
                    sx={{ background: 'rgba(19,23,38,0.8)', color: '#3B82F6', width: 30, height: 30 }}
                  >
                    <EditIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(item._id)}
                    sx={{ background: 'rgba(19,23,38,0.8)', color: '#EF4444', width: 30, height: 30 }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: '1rem' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {item.description}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ color: '#FF6B35', fontSize: '1.1rem' }}
                >
                  {item.price.toLocaleString('vi-VN')} đ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MenuIcon sx={{ fontSize: 64, color: '#94A3B8', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Không tìm thấy món ăn</Typography>
        </Box>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingItem ? 'Sửa món ăn' : 'Thêm món mới'}
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tên món" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField fullWidth label="Giá (VNĐ)" type="number" value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField fullWidth select label="Loại món" value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            sx={{ mb: 2 }}
          >
            {categories.filter(c => c !== 'Tất cả').map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Mô tả" multiline rows={3} value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField fullWidth label="URL hình ảnh" value={formData.image}
            onChange={e => setFormData({ ...formData, image: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={<Switch checked={formData.available} onChange={e => setFormData({ ...formData, available: e.target.checked })} color="success" />}
            label="Còn phục vụ"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8F65)' }}
          >
            {editingItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MenuPage
