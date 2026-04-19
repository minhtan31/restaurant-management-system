import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar,
  Menu, MenuItem, Badge, Tooltip, Divider, ListItemIcon,
} from '@mui/material'
import {
  Menu as MenuIcon, Notifications as NotificationsIcon,
  Person as PersonIcon, Logout as LogoutIcon, Settings as SettingsIcon,
} from '@mui/icons-material'
import { logout } from '../../store/slices/authSlice'

const Header = ({ handleDrawerToggle }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMenu = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    handleClose()
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' }, color: '#1E293B' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              display: { xs: 'none', sm: 'block' },
              background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Restaurant Manager
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Thông báo">
            <IconButton sx={{ color: '#64748B', '&:hover': { color: '#FF6B35' } }}>
              <Badge badgeContent={3} color="error"
                sx={{ '& .MuiBadge-badge': { boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)' } }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Tài khoản">
            <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 38, height: 38,
                  background: 'linear-gradient(135deg, #FF6B35, #FF8F65)',
                  fontSize: '0.9rem', fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(255, 107, 53, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 4px 16px rgba(255, 107, 53, 0.35)' },
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5, minWidth: 220,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1E293B' }}>
                {user?.name || 'Admin'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                {user?.email || 'admin@restaurant.com'}
              </Typography>
            </Box>
            <Divider sx={{ mx: 1 }} />
            <MenuItem onClick={handleClose} sx={{ py: 1.2 }}>
              <ListItemIcon><PersonIcon fontSize="small" sx={{ color: '#64748B' }} /></ListItemIcon>
              Hồ sơ
            </MenuItem>
            <MenuItem onClick={handleClose} sx={{ py: 1.2 }}>
              <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: '#64748B' }} /></ListItemIcon>
              Cài đặt
            </MenuItem>
            <Divider sx={{ mx: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', py: 1.2 }}>
              <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
