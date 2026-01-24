import { Box, Toolbar, CssBaseline, CircularProgress } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Sidebar from './Sidebar';
import AppBar from './AppBar';

const drawerWidth = 260; // Slightly wider for better readability

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar drawerWidth={drawerWidth} />
      <Sidebar drawerWidth={drawerWidth} />
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f8fafc', // Slate-50/100ish for content bg
          p: 4, 
          minHeight: '100vh', 
          width: { sm: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Toolbar sx={{ height: 64 }} /> {/* Match AppBar height */}
        <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={40} thickness={4} />
            </Box>
        }>
            <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};

export default Layout;
