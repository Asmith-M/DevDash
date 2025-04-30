// src/components/GitHubEvents.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Badge } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, Star, GitBranch, AlertCircle } from 'lucide-react';
import { connectToWebhookEvents, addWebhookEventListener, fetchRecentEvents } from '../services/github';
import { useAuth } from '../auth/AuthProvider';

const GitHubEvents = ({ username }) => {
  const [events, setEvents] = useState([]);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const { user } = useAuth();

  // Load initial events and set up real-time connection
  useEffect(() => {
    const loadInitialEvents = async () => {
      try {
        const recentEvents = await fetchRecentEvents();
        setEvents(recentEvents.slice(0, 5)); // Show 5 most recent events
      } catch (error) {
        console.error('Failed to load recent events:', error);
      }
    };

    loadInitialEvents();
    
    // Connect to real-time events
    connectToWebhookEvents();
    
    // Set up event listener for new webhook events
    const removeListener = addWebhookEventListener((newEvent) => {
      // Only handle events for repositories owned by the current user
      if (newEvent.payload?.repository?.owner?.login === username) {
        // Update events list with the new event at the top
        setEvents(prevEvents => {
          const updated = [newEvent, ...prevEvents].slice(0, 5);
          return updated;
        });
        
        // Increment new events counter for notification
        setNewEventsCount(prev => prev + 1);
        
        // Notify user with a browser notification if permission granted
        if (Notification.permission === 'granted') {
          const { summary } = newEvent;
          new Notification('GitHub Activity', {
            body: summary?.message || `New activity on ${summary?.repo || 'your repository'}`,
            icon: '/github-icon.png'
          });
        }
      }
    });
    
    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Clean up on unmount
    return () => {
      if (removeListener) removeListener();
    };
  }, [username]);

  // Reset counter when user views the component
  useEffect(() => {
    const resetCounter = () => {
      setNewEventsCount(0);
    };
    
    // Reset counter when component is visible
    window.addEventListener('focus', resetCounter);
    
    return () => {
      window.removeEventListener('focus', resetCounter);
    };
  }, []);

  // Get icon based on event type
  const getEventIcon = (event) => {
    switch (event.type) {
      case 'push':
        return <GitCommit className="text-blue-500" />;
      case 'star':
        return <Star className="text-yellow-500" />;
      case 'repository':
        return <GitBranch className="text-green-500" />;
      default:
        return <AlertCircle className="text-gray-500" />;
    }
  };

  return (
    <Paper elevation={1} sx={{ overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.1)' 
      }}>
        <Typography variant="h6">
          Recent Activity
        </Typography>
        {newEventsCount > 0 && (
          <Badge badgeContent={newEventsCount} color="error" />
        )}
      </Box>
      
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        <AnimatePresence>
          {events.length > 0 ? (
            events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem divider>
                  <ListItemIcon>
                    {getEventIcon(event)}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.summary?.message || `${event.type} event`}
                    secondary={new Date(event.timestamp).toLocaleString()}
                  />
                </ListItem>
              </motion.div>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary="No recent events" 
                secondary="Events will appear here when GitHub activity occurs"
              />
            </ListItem>
          )}
        </AnimatePresence>
      </List>
    </Paper>
  );
};

export default GitHubEvents;