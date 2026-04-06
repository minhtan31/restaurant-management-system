import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Avatar, Tooltip, Grid, InputAdornment,
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Phone as PhoneIcon, Email as EmailIcon,
} from '@mui/icons-material'
import { setStaff, addStaff, updateStaff, deleteStaff, setLoading } from '../../store/slices/staffSlice'
import staffService from '../../services/staffService'

const roleConfig = {
  admin: { label: 'Quản lý', color: '#FF6B35', icon: <AdminIcon sx={{ fontSize: 16 }} /> },
  staff: { label: 'Nhân viên', color: '#4ECDC4', icon: <PersonIcon sx={{ fontSize: 16 }} /> },
}

const Staff = () => {
  const dispatch = useDispatch()
  const { staff } = useSelector(state => state.staff)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', status: 'active',
  })

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        dispatch(setLoading(true))
        const data = await staffService.getAll()
        dispatch(setStaff(data))
      } catch (error) {
        console.error('Error fetching staff:', error)
      } finally {
        dispatch(setLoading(false))
      }
    }
    fetchStaff()
  }, [dispatch])

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpen = (person = null) => {
    if (person) {
      setEditingStaff(person)
      setFormData({ name: person.name, email: person.email, phone: person.phone || '', password: '', status: person.status })
    } else {
      setEditingStaff(null)
      setFormData({ name: '', email: '', phone: '', password: '', status: 'active' })
    }
    setOpenDialog(true)
  }

  const handleSave = async () => {
    try {
      if (editingStaff) {
        const { password, ...updateData } = formData
        const updated = await staffService.update(editingStaff._id, updateData)
        dispatch(updateStaff(updated))
      } else {
        const created = await staffService.create(formData)
        dispatch(addStaff(created))
      }
      setOpenDialog(false)
    } catch (error) {
      console.error('Error saving staff:', error)
      alert(error.response?.data?.message || 'Lỗi khi lưu nhân viên')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        await staffService.delete(id)
        dispatch(deleteStaff(id))
      } catch (error) {
        console.error('Error deleting staff:', error)
        alert(error.response?.data?.message || 'Lỗi khi xóa nhân viên')
      }
    }
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Nhân viên</Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý nhân viên nhà hàng ({staff.length} người)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8F65)' }}
        >
          Thêm nhân viên
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Object.entries(roleConfig).map(([key, config]) => {
          const count = staff.filter(s => s.role === key).length
          return (
            <Grid item xs={6} sm={4} md={3} key={key}>
              <Card sx={{ border: `1px solid ${config.color}22` }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 44, height: 44, background: `${config.color}15`, color: config.color }}>
                    {config.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{config.label}</Typography>
                    <Typography variant="h5" fontWeight={800}>{count}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
        <Grid item xs={6} sm={4} md={3}>
          <Card sx={{ border: '1px solid rgba(34,197,94,0.22)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 44, height: 44, background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Đang hoạt động</Typography>
                <Typography variant="h5" fontWeight={800}>{staff.filter(s => s.status === 'active').length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        placeholder="Tìm kiếm nhân viên..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ mb: 3, minWidth: 300 }}
        size="small"
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }}
      />

      {/* Staff table */}
      <TableContainer component={Paper} sx={{ background: '#131726', borderRadius: 3, border: '1px solid rgba(148,163,184,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nhân viên</TableCell>
              <TableCell>Liên hệ</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.map((person, index) => {
              const config = roleConfig[person.role] || roleConfig.staff
              return (
                <TableRow key={person._id} sx={{ '&:hover': { background: 'rgba(255,107,53,0.02)' }, animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{
                        width: 38, height: 38,
                        background: `linear-gradient(135deg, ${config.color}33, ${config.color}66)`,
                        color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                      }}>
                        {person.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{person.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <EmailIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                        <Typography variant="caption" color="text.secondary">{person.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                        <Typography variant="caption" color="text.secondary">{person.phone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip icon={config.icon} label={config.label} size="small"
                      sx={{ background: `${config.color}15`, color: config.color, fontWeight: 600, '& .MuiChip-icon': { color: config.color } }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={person.status === 'active' ? 'Hoạt động' : 'Nghỉ việc'} size="small"
                      sx={{
                        background: person.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: person.status === 'active' ? '#22C55E' : '#EF4444',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(person.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => handleOpen(person)} sx={{ color: '#3B82F6' }}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" onClick={() => handleDelete(person._id)} sx={{ color: '#EF4444' }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Họ và tên" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField fullWidth label="Email" type="email" value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          {!editingStaff && (
            <TextField fullWidth label="Mật khẩu" type="password" value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              sx={{ mb: 2 }}
              helperText="Tối thiểu 6 ký tự"
            />
          )}
          <TextField fullWidth label="Số điện thoại" value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField fullWidth select label="Trạng thái" value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <MenuItem value="active">Hoạt động</MenuItem>
            <MenuItem value="inactive">Nghỉ việc</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94A3B8' }}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8F65)' }}
          >
            {editingStaff ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Staff
