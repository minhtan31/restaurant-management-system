import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon, Receipt as ReceiptIcon,
  TableRestaurant as TableIcon, People as PeopleIcon,
  AttachMoney as MoneyIcon,
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

const StatCard = ({ title, value, icon, color, subtitle, delay = 0 }) => (
  <Card
    className="stat-card-3d"
    sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeIn 0.5s ease-out ${delay}s both`,
      '&::before': {
        content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}66, transparent)`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B', lineHeight: 1.1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{
          width: 52, height: 52,
          background: `${color}12`,
          color: color,
          border: `1px solid ${color}20`,
        }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{
      p: 1.5, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>
      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="body2" fontWeight={700} sx={{ color: p.color, mt: 0.3 }}>
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

  const categoryMap = {}
  menuItems.forEach(item => {
    if (!categoryMap[item.category]) categoryMap[item.category] = 0
    categoryMap[item.category]++
  })
  const categoryColors = { 'Món chính': '#FF6B35', 'Khai vị': '#4ECDC4', 'Đồ uống': '#3B82F6', 'Tráng miệng': '#F59E0B' }
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name, value, color: categoryColors[name] || '#94A3B8',
  }))

  const revenueByDay = {}
  orders.forEach(o => {
    const day = new Date(o.createdAt).toLocaleDateString('vi-VN', { weekday: 'narrow' })
    revenueByDay[day] = (revenueByDay[day] || 0) + (o.totalAmount || 0)
  })
  const revenueData = ['T2','T3','T4','T5','T6','T7','CN'].map(name => ({ name, revenue: revenueByDay[name] || 0 }))

  const hourMap = {}
  orders.forEach(o => { const h = new Date(o.createdAt).getHours(); hourMap[h] = (hourMap[h] || 0) + 1 })
  const ordersByHour = Array.from({ length: 15 }, (_, i) => i + 8).map(h => ({ hour: `${h}h`, orders: hourMap[h] || 0 }))

  const dishMap = {}
  orders.forEach(o => {
    o.items?.forEach(item => {
      const name = item.menuItem?.name || 'N/A'
      if (!dishMap[name]) dishMap[name] = { name, orders: 0, revenue: 0 }
      dishMap[name].orders += item.quantity
      dishMap[name].revenue += (item.menuItem?.price || 0) * item.quantity
    })
  })
  const topDishes = Object.values(dishMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  const rankColors = ['#FF6B35', '#4ECDC4', '#3B82F6', '#F59E0B', '#EF4444']

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B' }}>Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>Tổng quan hoạt động nhà hàng hôm nay</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Doanh thu hôm nay" value={`${(todayRevenue/1000000).toFixed(1)}M đ`} icon={<MoneyIcon />} color="#FF6B35" subtitle={`${orders.length} đơn hàng`} delay={0} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Đơn hàng" value={orders.length} icon={<ReceiptIcon />} color="#4ECDC4" subtitle={`${activeOrders} đang xử lý`} delay={0.1} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Bàn đang phục vụ" value={`${occupiedTables}/${tables.length}`} icon={<TableIcon />} color="#3B82F6" subtitle={`${tables.filter(t=>t.status==='reserved').length} đặt trước`} delay={0.2} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Nhân viên" value={staff.filter(s=>s.status==='active').length} icon={<PeopleIcon />} color="#F59E0B" subtitle={`/${staff.length} tổng cộng`} delay={0.3} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>Doanh thu tuần này</Typography>
                <Chip label="Tuần này" size="small" sx={{ background: 'rgba(255,107,53,0.08)', color: '#FF6B35', fontWeight: 600, fontSize: '0.7rem' }} />
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000000).toFixed(0)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} fill="url(#colorRevenue)" dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, stroke: '#FF6B35', strokeWidth: 2, fill: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }} gutterBottom>Phân loại món ăn</Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="#fff" strokeWidth={3}>
                        {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>{value}</span>} />
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Typography sx={{ color: '#94A3B8' }}>Chưa có dữ liệu</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }} gutterBottom>Đơn hàng theo giờ</Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByHour}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ECDC4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#4ECDC4" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }} gutterBottom>Món bán chạy</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Món ăn</TableCell>
                    <TableCell align="center">Đơn</TableCell>
                    <TableCell align="right">Doanh thu</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {topDishes.map((dish, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{
                              width: 30, height: 30, fontSize: '0.7rem', fontWeight: 800,
                              background: i < 3 ? `linear-gradient(135deg, ${rankColors[i]}, ${rankColors[i]}99)` : `${rankColors[i]}15`,
                              color: i < 3 ? '#fff' : rankColors[i],
                            }}>{i + 1}</Avatar>
                            <Typography variant="body2" fontWeight={500} sx={{ color: '#1E293B' }}>{dish.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center"><Typography variant="body2" fontWeight={600}>{dish.orders}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={600} sx={{ color: '#FF6B35' }}>{(dish.revenue/1000000).toFixed(1)}M đ</Typography></TableCell>
                      </TableRow>
                    ))}
                    {topDishes.length === 0 && <TableRow><TableCell colSpan={3} align="center"><Typography sx={{ color: '#94A3B8' }}>Chưa có dữ liệu</Typography></TableCell></TableRow>}
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
