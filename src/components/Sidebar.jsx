import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMonthName } from '../utils/dateHelpers';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Button,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  ListAlt as ListIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
  DateRange as DateRangeIcon,
  BusinessCenter
} from '@mui/icons-material';

const Sidebar = ({ drawerWidth }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const params = useParams();
  const currentYear = new Date().getFullYear();
  const isAdmin = user?.role === 'admin';

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Monthly Overview', icon: <CalendarIcon />, path: '/' },
    { text: 'All Bookings', icon: <ListIcon />, path: '/bookings' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  ];

  const adminItems = [
    { text: 'Users', icon: <GroupIcon />, path: '/users' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/items' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Helper for rendering list items to reduce duplication
  const renderListItem = (text, icon, path, selected, indent = false) => (
    <ListItem key={text} disablePadding sx={{ px: 2, py: 0.5 }}>
      <ListItemButton
        component={Link}
        to={path}
        selected={selected}
        sx={{
          borderRadius: 3,
          pl: indent ? 4 : 2,
          transition: 'all 0.2s',
          '&.Mui-selected': { 
            bgcolor: 'primary.main', 
            color: 'white', 
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', // Indigo shadow
            '&:hover': { bgcolor: 'primary.dark' },
            '& .MuiListItemIcon-root': { color: 'white' }
          },
          '&:hover': { 
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            transform: 'translateX(4px)'
          },
          '& .MuiListItemIcon-root': { 
            color: selected ? 'white' : 'grey.400',
            minWidth: 40,
            transition: 'color 0.2s'
          },
          '& .MuiListItemText-primary': {
            fontWeight: selected ? 600 : 500,
            fontSize: '0.9rem'
          }
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          bgcolor: '#0f172a', // Slate-900
          color: 'white',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, boxShadow: '0 0 15px rgba(79,70,229,0.5)' }}>
          <BusinessCenter fontSize="small" />
        </Avatar>
        <Box>
           <Typography variant="h6" fontWeight="800" letterSpacing="-0.5px" sx={{ background: 'linear-gradient(45deg, #fff, #94a3b8)', backgroundClip: 'text', textFillColor: 'transparent', color: 'white' }}>
            NEXUS
          </Typography>
          <Typography variant="caption" color="grey.500" fontWeight="500" letterSpacing="1px" textTransform="uppercase">
            Booking System
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 3 }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
        <List>
           <Box sx={{ px: 3, pb: 1, pt: 1 }}>
            <Typography variant="caption" fontWeight="700" color="grey.600" textTransform="uppercase">
              Main Menu
            </Typography>
          </Box>
          {menuItems.map((item) => {
             const isMonthlyOverview = item.path === '/';
             const selected = isMonthlyOverview 
                ? (isActive('/') && !params.monthId && location.pathname !== '/dashboard')
                : isActive(item.path);
             return renderListItem(item.text, item.icon, item.path, selected);
          })}

          {/* Dynamic Navigation */}
          {(params.monthId || params.categoryId) && (
            <>
              <Box sx={{ px: 3, pb: 1, pt: 3 }}>
                <Typography variant="caption" fontWeight="700" color="grey.600" textTransform="uppercase">
                  Current View
                </Typography>
              </Box>
              
              {params.monthId && (
                 renderListItem(
                   `${getMonthName(parseInt(params.monthId))} Categories`, 
                   <CategoryIcon fontSize="small" />, 
                   `/month/${params.monthId}`, 
                   isActive(`/month/${params.monthId}`) && !params.categoryId
                 )
              )}

              {params.categoryId && (
                 renderListItem(
                   'Weeks Selection', 
                   <DateRangeIcon fontSize="small" />, 
                   `/month/${params.monthId}/category/${params.categoryId}`, 
                   isActive(`/month/${params.monthId}/category/${params.categoryId}`) && !params.weekNumber,
                   true // Indent
                 )
              )}
            </>
          )}

          {isAdmin && (
             <>
               <Box sx={{ px: 3, pb: 1, pt: 3 }}>
                <Typography variant="caption" fontWeight="700" color="grey.600" textTransform="uppercase">
                  Administration
                </Typography>
              </Box>
               {adminItems.map((item) => renderListItem(item.text, item.icon, item.path, isActive(item.path)))}
             </>
          )}
        </List>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
        <Button
             fullWidth
             onClick={logout}
             startIcon={<LogoutIcon />}
             sx={{ 
               justifyContent: 'flex-start', 
               color: 'grey.400', 
               textTransform: 'none',
               fontWeight: 600,
               px: 2,
               py: 1.5,
               borderRadius: 2,
               '&:hover': { bgcolor: 'rgba(255, 68, 68, 0.1)', color: '#ff5252' } 
              }}
           >
             Sign Out
           </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
