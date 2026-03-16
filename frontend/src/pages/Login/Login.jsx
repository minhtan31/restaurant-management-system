import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material'
import { loginSuccess, loginStart, loginFailure } from '../../store/slices/authSlice'
import authService from '../../services/authService'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Vui lòng nhập đầy đủ thông tin'))
      return
    }
    dispatch(loginStart())
    try {
      const data = await authService.login(formData)
      dispatch(loginSuccess({
        user: data.user,
        token: data.token,
      }))
      navigate('/dashboard')
    } catch (error) {
      dispatch(loginFailure(
        error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      ))
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(255, 107, 53, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(78, 205, 196, 0.06) 0%, transparent 50%), #0A0E1A',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box sx={{
        position: 'absolute', top: -100, right: -100, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(255, 107, 53, 0.03)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -80, left: -80, width: 250, height: 250,
        borderRadius: '50%', background: 'rgba(78, 205, 196, 0.03)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          background: 'rgba(19, 23, 38, 0.8)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
                boxShadow: '0 8px 30px rgba(255, 107, 53, 0.3)',
              }}
            >
              <RestaurantIcon sx={{ fontSize: 34 }} />
            </Avatar>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              Đăng Nhập
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hệ thống quản lý nhà hàng
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2.5 }}
              placeholder="admin@restaurant.com"
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
              placeholder="••••••••"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
                boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E55A2B 0%, #FF6B35 100%)',
                  boxShadow: '0 6px 30px rgba(255, 107, 53, 0.4)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Nhập'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?{' '}
              <Typography
                component={Link}
                to="/signup"
                variant="body2"
                sx={{
                  color: '#FF6B35',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Đăng ký ngay
              </Typography>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(255, 107, 53, 0.05)', border: '1px solid rgba(255, 107, 53, 0.1)' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              💡 Tài khoản demo:
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Admin: <strong>admin@restaurant.com</strong> / 123456
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Staff: <strong>staff@restaurant.com</strong> / 123456
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
