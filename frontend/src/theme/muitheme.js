import { createTheme } from '@mui/material/styles'

const muitheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B35',
      light: '#FF8F65',
      dark: '#E55A2B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4ECDC4',
      light: '#7EDDD6',
      dark: '#3BAEA7',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    success: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#16A34A',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    divider: 'rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: '#1E293B',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      color: '#1E293B',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
      color: '#1E293B',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.25rem',
      color: '#1E293B',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
      color: '#1E293B',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#1E293B',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '0.95rem',
      color: '#64748B',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
      color: '#334155',
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.5,
      color: '#475569',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6FA',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(255, 107, 53, 0.25)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #E55A2B 0%, #FF6B35 100%)',
            boxShadow: '0 6px 25px rgba(255, 107, 53, 0.35)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3BAEA7 0%, #4ECDC4 100%)',
            boxShadow: '0 6px 25px rgba(78, 205, 196, 0.3)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            background: 'rgba(255, 107, 53, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 107, 53, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#FAFBFC',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 107, 53, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF6B35',
              boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.08)',
            },
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '14px 16px',
          color: '#334155',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#94A3B8',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.02)',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          border: '1px solid transparent',
          transition: 'all 0.25s ease',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.25s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.06)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 6px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.06)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 107, 53, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.12)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
        },
      },
    },
  },
})

export default muitheme
