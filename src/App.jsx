// App.jsx
import React, { useState, useEffect } from 'react';
import { AppBar, Box, Drawer, Toolbar, Typography, IconButton, Avatar, Tooltip, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ColorModeContext } from './theme/ThemeContext';
import { useAuth } from './auth/AuthProvider';
import AuthButton from './components/AuthButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
// import { db } from './auth/firebase.jsx'; // Removed Firestore import
// import { collection, onSnapshot } from 'firebase/firestore'; // Removed Firestore import

// Import the Dashboard component we created
import GithubDashboard from './pages/Dashboard';

// Main App Component
function App() {
  const colorMode = React.useContext(ColorModeContext);
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // To track current view
  // const [repos, setRepos] = useState([]); // Removed Firestore state

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Handle navigation
  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsDrawerOpen(false); // Close drawer after selection on mobile
  };

  // Render the appropriate view based on currentView state
  const renderView = () => {
    if (!user) {
      return <div>Login Page</div>;
    }

    switch (currentView) {
      case 'dashboard':
        return <GithubDashboard username={user.displayName || "Asmith-M"} />; // Use dynamic username if available
      case 'settings':
        return (
          <div>
            <Typography variant="h4">Settings</Typography>
            <Typography>Settings page content goes here</Typography>
          </div>
        );
      default:
        return <GithubDashboard username={user.displayName || "Asmith-M"} />; // Default to dashboard
    }
  };

  // Removed Firestore useEffect
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(collection(db, 'repos'), (snapshot) => {
  //     const reposData = snapshot.docs.map(doc => doc.data());
  //     setRepos(reposData);
  //   });

  //   return () => unsubscribe();
  // }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DevDash
          </Typography>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="inherit">
                {user.displayName}
              </Typography>
              <Avatar alt={user.displayName} src={user.photoURL} sx={{ width: 30, height: 30 }} />
            </Box>
          ) : null}
          <Tooltip title="Toggle Light/Dark Mode">
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {colorMode.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <AuthButton />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={isDrawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawerPaper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ width: 240 }}>
          <Typography variant="h6" sx={{ m: 2 }}>
            Navigation
          </Typography>
          <List>
            <ListItemButton
              onClick={() => handleNavigation('dashboard')}
              key="dashboard"
              selected={currentView === 'dashboard'}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton
              onClick={() => handleNavigation('settings')}
              key="settings"
              selected={currentView === 'settings'}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
            {/* Add more sidebar items here */}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {renderView()}
      </Box>
    </Box>
  );
}

export default App;
