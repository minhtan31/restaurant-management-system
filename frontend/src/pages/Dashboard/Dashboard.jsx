import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  TableRestaurant as TableIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  RestaurantMenu as MenuIcon,
} from '@mui/icons-material'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { setMenuItems } from '../../store/slices/menuSlice'
import { setOrders } from '../../store/slices/orderSlice'
import { setTables } from '../../store/slices/tableSlice'
import { setStaff } from '../../store/slices/staffSlice'
import menuService from '../../services/menuService'
import orderService from '../../services/orderService'
import tableService from '../../services/tableService'
import staffService from '../../services/staffService'

const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
  <Card
    sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
            color: color,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      {trend !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUpIcon
            sx={{
              fontSize: 16,
              color: trend >= 0 ? '#22C55E' : '#EF4444',
              transform: trend < 0 ? 'rotate(180deg)' : 'none',
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: trend >= 0 ? '#22C55E' : '#EF4444', fontWeight: 600 }}
          >
            {Math.abs(trend)}% so với tuần trước
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{
      p: 1.5, background: 'rgba(19, 23, 38, 0.95)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 2,
    }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="body2" fontWeight={600} sx={{ color: p.color }}>
          {typeof p.value === 'number' && p.value > 1000
            ? `${(p.value / 1000000).toFixed(1)}M đ`
            : `${p.value} đơn`}
        </Typography>
      ))}
    </Box>
  )
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { orders } = useSelector(state => state.order)
  const { tables } = useSelector(state => state.table)
  const { items: menuItems } = useSelector(state => state.menu)
  const { staff } = useSelector(state => state.staff)

  // Fetch all data if not loaded yet
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [menuData, orderData, tableData, staffData] = await Promise.all([
          menuItems.length === 0 ? menuService.getAll() : Promise.resolve(null),
          orders.length === 0 ? orderService.getAll() : Promise.resolve(null),
          tables.length === 0 ? tableService.getAll() : Promise.resolve(null),
          staff.length === 0 ? staffService.getAll() : Promise.resolve(null),
        ])
        if (menuData) dispatch(setMenuItems(menuData))
        if (orderData) dispatch(setOrders(orderData))
        if (tableData) dispatch(setTables(tableData))
        if (staffData) dispatch(setStaff(staffData))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }
    fetchAll()
  }, [dispatch])

  const activeOrders = orders.filter(o => o.status !== 'completed').length
  const occupiedTables = tables.filter(t => t.status === 'occupied').length
  const todayRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  // Build category data from real menu items
  const categoryMap = {}
  menuItems.forEach(item => {
    if (!categoryMap[item.category]) categoryMap[item.category] = 0
    categoryMap[item.category]++
  })
  const categoryColors = {
    'Món chính': '#FF6B35',
    'Khai vị': '#4ECDC4',
    'Đồ uống': '#3B82F6',
    'Tráng miệng': '#F59E0B',
  }
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#94A3B8',
  }))

  // Build revenue by day from real orders
  const revenueByDay = {}
  orders.forEach(o => {
    const day = new Date(o.createdAt).toLocaleDateString('vi-VN', { weekday: 'narrow' })
    revenueByDay[day] = (revenueByDay[day] || 0) + (o.totalAmount || 0)
  })
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const revenueData = dayNames.map(name => ({
    name,
    revenue: revenueByDay[name] || 0,
  }))

  // Build orders by hour from real orders
  const hourMap = {}
  orders.forEach(o => {
    const hour = new Date(o.createdAt).getHours()
    hourMap[hour] = (hourMap[hour] || 0) + 1
  })
  const ordersByHour = Array.from({ length: 15 }, (_, i) => i + 8).map(h => ({
    hour: `${h}h`,
    orders: hourMap[h] || 0,
  }))

  // Top dishes from real orders
  const dishMap = {}
  orders.forEach(o => {
    o.items?.forEach(item => {
      const name = item.menuItem?.name || 'N/A'
      if (!dishMap[name]) dishMap[name] = { name, orders: 0, revenue: 0 }
      dishMap[name].orders += item.quantity
      dishMap[name].revenue += (item.menuItem?.price || 0) * item.quantity
    })
  })
  const topDishes = Object.values(dishMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tổng quan hoạt động nhà hàng hôm nay
        </Typography>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Doanh thu hôm nay"
            value={`${(todayRevenue / 1000000).toFixed(1)}M đ`}
            icon={<MoneyIcon />}
            color="#FF6B35"
            subtitle={`${orders.length} đơn hàng`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Đơn hàng"
            value={orders.length}
            icon={<ReceiptIcon />}
            color="#4ECDC4"
            subtitle={`${activeOrders} đang xử lý`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Bàn đang phục vụ"
            value={`${occupiedTables}/${tables.length}`}
            icon={<TableIcon />}
            color="#3B82F6"
            subtitle={`${tables.filter(t => t.status === 'reserved').length} đặt trước`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Nhân viên"
            value={staff.filter(s => s.status === 'active').length}
            icon={<PeopleIcon />}
            color="#F59E0B"
            subtitle={`/${staff.length} tổng cộng`}
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Doanh thu tuần này
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Phân loại món ăn
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{value}</span>
                        )}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" variant="body2">Chưa có dữ liệu</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second charts row */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Đơn hàng theo giờ
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Món bán chạy
                </Typography>
                <Chip label="Từ đơn hàng" size="small" sx={{ background: 'rgba(255,107,53,0.1)', color: '#FF6B35' }} />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Món ăn</TableCell>
                      <TableCell align="center">Đơn</TableCell>
                      <TableCell align="right">Doanh thu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topDishes.map((dish, index) => (
                      <TableRow key={index} sx={{ '&:hover': { background: 'rgba(255,107,53,0.03)' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700,
                                background: `linear-gradient(135deg, ${['#FF6B35','#4ECDC4','#3B82F6','#F59E0B','#EF4444'][index]}22, ${['#FF6B35','#4ECDC4','#3B82F6','#F59E0B','#EF4444'][index]}44)`,
                                color: ['#FF6B35','#4ECDC4','#3B82F6','#F59E0B','#EF4444'][index],
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>{dish.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={600}>{dish.orders}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {(dish.revenue / 1000000).toFixed(1)}M đ
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {topDishes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography color="text.secondary" variant="body2">Chưa có dữ liệu</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
