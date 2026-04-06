import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  TableRestaurant as TableIcon,
  RestaurantMenu as MenuIcon,
  Receipt as OrderIcon,
  People as StaffIcon,
  Assessment as ReportIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material'

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Quản lý bàn', icon: <TableIcon />, path: '/tables' },
  { text: 'Thực đơn', icon: <MenuIcon />, path: '/menu' },
  { text: 'Đơn hàng', icon: <OrderIcon />, path: '/orders' },
  { text: 'Nhân viên', icon: <StaffIcon />, path: '/staff', adminOnly: true },
  { text: 'Báo cáo', icon: <ReportIcon />, path: '/reports', adminOnly: true },
]

const SlideBar = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/dashboard')}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
          }}
        >
          <RestaurantIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            NHÀ HÀNG
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Hệ thống quản lý
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)', mx: 2 }} />

      {/* Menu */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null
          const isActive = location.pathname === item.path

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  if (mobileOpen) handleDrawerToggle()
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.3,
                  px: 2,
                  transition: 'all 0.3s ease',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(78, 205, 196, 0.08) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #FF6B35' : '3px solid transparent',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(78, 205, 196, 0.1) 100%)'
                      : 'rgba(148, 163, 184, 0.05)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? '#FF6B35' : '#94A3B8',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F1F5F9' : '#94A3B8',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#FF6B35',
                      boxShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)', mx: 2 }} />

      {/* User Info */}
      <Box sx={{ p: 2.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: 'rgba(255, 107, 53, 0.05)',
            border: '1px solid rgba(255, 107, 53, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              background: 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name || 'Admin'}
            </Typography>
            <Chip
              label={user?.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                background: user?.role === 'admin'
                  ? 'rgba(255, 107, 53, 0.15)'
                  : 'rgba(78, 205, 196, 0.15)',
                color: user?.role === 'admin' ? '#FF6B35' : '#4ECDC4',
                mt: 0.3,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#0D1120',
            borderRight: '1px solid rgba(148, 163, 184, 0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#0D1120',
            borderRight: '1px solid rgba(148, 163, 184, 0.08)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  )
}

export default SlideBar
