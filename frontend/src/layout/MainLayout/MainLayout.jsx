import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Header from '../Header/Header'
import SlideBar from '../../components/SlideBar/SlideBar'

const DRAWER_WIDTH = 280
const COLLAPSED_WIDTH = 72

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F4F6FA',
    }}>
      <SlideBar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentWidth}px)` },
          ml: { md: `${currentWidth}px` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header handleDrawerToggle={handleDrawerToggle} />
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout
