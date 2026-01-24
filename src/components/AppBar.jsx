import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar as MuiAppBar, Toolbar, Typography, Box, Avatar, IconButton, Badge } from '@mui/material';
import { NotificationsOutlined, Search } from '@mui/icons-material';

const AppBar = ({ drawerWidth }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/bookings') return 'All Bookings';
    if (path === '/customers') return 'Client Management';
    if (path === '/reports') return 'Performance Reports';
    if (path === '/users') return 'Team & Access';
    if (path === '/inventory') return 'Inventory Control';
    if (path === '/settings') return 'System Settings';
    if (path.includes('/month/')) return 'Booking Calendar';
    return 'Booking System';
  };

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.5px' }}>
          {getPageTitle()}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" sx={{ color: 'grey.400' }}>
            <Search />
          </IconButton>
          <IconButton color="inherit" sx={{ mr: 2, color: 'grey.400' }}>
             <Badge badgeContent={0} color="error" variant="dot">
                <NotificationsOutlined />
             </Badge>
          </IconButton>
          
          <Box sx={{ height: 32, width: 1, bgcolor: 'divider', mx: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 1, cursor: 'pointer', borderRadius: 2, p: 0.5, '&:hover': { bgcolor: 'grey.50' } }}>
             <Avatar 
                sx={{ 
                  bgcolor: 'primary.light', 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                  width: 36,
                  height: 36,
                  fontSize: '0.9rem'
                }}
             >
                {user?.name?.charAt(0).toUpperCase()}
             </Avatar>
             <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.85rem' }}>
                 {user?.name}
               </Typography>
               <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                 {user?.role}
               </Typography>
             </Box>
          </Box>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
