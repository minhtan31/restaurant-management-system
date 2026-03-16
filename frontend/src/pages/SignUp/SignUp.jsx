import React, { useState } from 'react'
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
  Avatar,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material'
import authService from '../../services/authService'

const SignUp = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'staff',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 80% 30%, rgba(78, 205, 196, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 70%, rgba(255, 107, 53, 0.06) 0%, transparent 50%), #0A0E1A',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        position: 'absolute', top: -60, left: -60, width: 250, height: 250,
        borderRadius: '50%', background: 'rgba(78, 205, 196, 0.04)', filter: 'blur(50px)',
      }} />

      <Card
        sx={{
          maxWidth: 480,
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
                width: 64, height: 64, mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)',
                boxShadow: '0 8px 30px rgba(78, 205, 196, 0.3)',
              }}
            >
              <PersonAddIcon sx={{ fontSize: 34 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #4ECDC4 0%, #FF6B35 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5,
              }}
            >
              Đăng Ký
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo tài khoản mới cho hệ thống
            </Typography>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Đăng ký thành công! Đang chuyển hướng...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Họ và tên" name="name" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth select label="Vai trò" name="role" value={formData.role} onChange={handleChange} sx={{ mb: 2 }}>
              <MenuItem value="staff">Nhân viên</MenuItem>
              <MenuItem value="admin">Quản lý</MenuItem>
            </TextField>
            <TextField fullWidth label="Mật khẩu" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} sx={{ mb: 2 }}
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
            <TextField fullWidth label="Xác nhận mật khẩu" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" fullWidth size="large"
              disabled={loading}
              sx={{
                py: 1.5, fontSize: '1rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #3BAEA7 0%, #4ECDC4 100%)' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Ký'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?{' '}
              <Typography component={Link} to="/login" variant="body2"
                sx={{ color: '#4ECDC4', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Đăng nhập
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SignUp
