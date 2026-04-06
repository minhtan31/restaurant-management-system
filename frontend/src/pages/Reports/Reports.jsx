import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  ToggleButton, ToggleButtonGroup, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Avatar,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon, AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon, RestaurantMenu as MenuIcon,
} from '@mui/icons-material'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { setOrders } from '../../store/slices/orderSlice'
import orderService from '../../services/orderService'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ p: 1.5, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="body2" fontWeight={700} sx={{ color: p.color, mt: 0.3 }}>
          {p.name === 'revenue' ? `Doanh thu: ${(p.value / 1000000).toFixed(1)}M đ` : `Đơn hàng: ${p.value}`}
        </Typography>
      ))}
    </Box>
  )
}

const Reports = () => {
  const dispatch = useDispatch()
  const [timeRange, setTimeRange] = useState('daily')
  const { orders } = useSelector(state => state.order)

  useEffect(() => {
    const fetchOrders = async () => {
      try { if (orders.length === 0) { const data = await orderService.getAll(); dispatch(setOrders(data)) } }
      catch (error) { console.error('Error fetching orders:', error) }
    }
    fetchOrders()
  }, [dispatch])

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const dailyMap = {}
  orders.forEach(o => {
    const dateStr = new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 }
    dailyMap[dateStr].revenue += (o.totalAmount || 0); dailyMap[dateStr].orders += 1
  })
  const dailyRevenue = Object.values(dailyMap).sort((a, b) => { const [da, ma] = a.date.split('/'); const [db, mb] = b.date.split('/'); return (parseInt(ma) * 100 + parseInt(da)) - (parseInt(mb) * 100 + parseInt(db)) })

  const monthlyMap = {}
  orders.forEach(o => {
    const month = `T${new Date(o.createdAt).getMonth() + 1}`
    if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, orders: 0 }
    monthlyMap[month].revenue += (o.totalAmount || 0); monthlyMap[month].orders += 1
  })
  const monthOrder = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']
  const monthlyRevenue = monthOrder.filter(m => monthlyMap[m]).map(m => monthlyMap[m])

  const catMap = {}
  orders.forEach(o => {
    o.items?.forEach(item => {
      const cat = item.menuItem?.category || 'Khác'
      if (!catMap[cat]) catMap[cat] = { name: cat, value: 0, revenue: 0 }
      catMap[cat].value += item.quantity; catMap[cat].revenue += (item.menuItem?.price || 0) * item.quantity
    })
  })
  const categoryColors = { 'Món chính': '#FF6B35', 'Khai vị': '#4ECDC4', 'Đồ uống': '#3B82F6', 'Tráng miệng': '#F59E0B', 'Khác': '#94A3B8' }
  const categoryRevenue = Object.values(catMap).map(c => ({ ...c, color: categoryColors[c.name] || '#94A3B8' }))

  const dishMap = {}
  orders.forEach(o => {
    o.items?.forEach(item => {
      const name = item.menuItem?.name || 'N/A'
      if (!dishMap[name]) dishMap[name] = { name, orders: 0, revenue: 0 }
      dishMap[name].orders += item.quantity; dishMap[name].revenue += (item.menuItem?.price || 0) * item.quantity
    })
  })
  const topDishes = Object.values(dishMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8).map((d, i) => ({ ...d, rank: i + 1 }))
  const bestDish = topDishes.length > 0 ? topDishes[0] : null

  const chartData = timeRange === 'daily' ? dailyRevenue : monthlyRevenue
  const xKey = timeRange === 'daily' ? 'date' : 'month'
  const rankColors = ['#FF6B35', '#4ECDC4', '#3B82F6']

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B' }}>Báo cáo & Thống kê</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Phân tích doanh thu và hiệu suất nhà hàng</Typography>
        </Box>
        <ToggleButtonGroup value={timeRange} exclusive onChange={(_, v) => v && setTimeRange(v)}
          sx={{ '& .MuiToggleButton-root': { border: '1px solid rgba(0,0,0,0.08)', color: '#64748B', px: 3, fontWeight: 600,
            '&.Mui-selected': { background: 'rgba(255,107,53,0.08)', color: '#FF6B35', borderColor: 'rgba(255,107,53,0.2)' } } }}>
          <ToggleButton value="daily">Ngày</ToggleButton>
          <ToggleButton value="monthly">Tháng</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Tổng doanh thu', value: `${(totalRevenue / 1000000).toFixed(1)}M đ`, sub: `${totalOrders} đơn hàng`, color: '#FF6B35', icon: <MoneyIcon /> },
          { title: 'Tổng đơn hàng', value: totalOrders.toLocaleString(), sub: 'Tất cả trạng thái', color: '#4ECDC4', icon: <ReceiptIcon /> },
          { title: 'Giá trị TB/đơn', value: `${(avgOrderValue / 1000).toFixed(0)}K đ`, sub: 'Trung bình', color: '#3B82F6', icon: <TrendingUpIcon /> },
          { title: 'Món bán chạy nhất', value: bestDish?.name || 'N/A', sub: bestDish ? `${bestDish.orders} phần` : '', color: '#F59E0B', icon: <MenuIcon /> },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card className="stat-card-3d" sx={{
              position: 'relative', overflow: 'hidden', animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`,
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${card.color}, ${card.color}44, transparent)` },
            }}>
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ my: 0.5, color: '#1E293B' }}>{card.value}</Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{card.sub}</Typography>
                  </Box>
                  <Avatar sx={{ background: `${card.color}12`, color: card.color, width: 48, height: 48, border: `1px solid ${card.color}20` }}>{card.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>Doanh thu {timeRange === 'daily' ? 'theo ngày' : 'theo tháng'}</Typography>
                <Chip label={`${chartData.length} mục`} size="small" sx={{ background: 'rgba(255,107,53,0.08)', color: '#FF6B35', fontWeight: 600 }} />
              </Box>
              <Box sx={{ height: 350 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="reportRevGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} /><stop offset="95%" stopColor="#FF6B35" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey={xKey} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} fill="url(#reportRevGrad)" dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, stroke: '#FF6B35', strokeWidth: 2, fill: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography sx={{ color: '#94A3B8' }}>Chưa có dữ liệu</Typography></Box>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }} gutterBottom>Doanh thu theo loại</Typography>
              <Box sx={{ height: 250, mb: 2 }}>
                {categoryRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="#fff" strokeWidth={3}>
                      {categoryRevenue.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie><Tooltip content={<CustomTooltip />} /></PieChart>
                  </ResponsiveContainer>
                ) : <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography sx={{ color: '#94A3B8' }}>Chưa có dữ liệu</Typography></Box>}
              </Box>
              {categoryRevenue.map(cat => (
                <Box key={cat.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                    <Typography variant="body2" sx={{ color: '#334155' }}>{cat.name}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B' }}>{cat.value} phần</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }} gutterBottom>Xu hướng đơn hàng</Typography>
              <Box sx={{ height: 300 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey={xKey} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="orders" stroke="#4ECDC4" strokeWidth={3} dot={{ fill: '#4ECDC4', r: 4, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#4ECDC4', strokeWidth: 2, fill: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography sx={{ color: '#94A3B8' }}>Chưa có dữ liệu</Typography></Box>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }} gutterBottom>Top món bán chạy</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow><TableCell>#</TableCell><TableCell>Món ăn</TableCell><TableCell align="center">Số lượng</TableCell><TableCell align="right">Doanh thu</TableCell></TableRow></TableHead>
                  <TableBody>
                    {topDishes.map(dish => (
                      <TableRow key={dish.rank}>
                        <TableCell>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', fontWeight: 800,
                            background: dish.rank <= 3 ? `linear-gradient(135deg, ${rankColors[dish.rank - 1]}, ${rankColors[dish.rank - 1]}99)` : '#F1F5F9',
                            color: dish.rank <= 3 ? '#fff' : '#94A3B8' }}>{dish.rank}</Avatar>
                        </TableCell>
                        <TableCell><Typography variant="body2" fontWeight={500} sx={{ color: '#1E293B' }}>{dish.name}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2">{dish.orders.toLocaleString()}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={600} sx={{ color: '#FF6B35' }}>{(dish.revenue / 1000000).toFixed(1)}M đ</Typography></TableCell>
                      </TableRow>
                    ))}
                    {topDishes.length === 0 && <TableRow><TableCell colSpan={4} align="center"><Typography sx={{ color: '#94A3B8' }}>Chưa có dữ liệu</Typography></TableCell></TableRow>}
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

export default Reports
