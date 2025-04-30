import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Chip, Link,
  LinearProgress, Box, ToggleButtonGroup,
  ToggleButton, Divider, Tooltip
} from '@mui/material';
import { subscribeToJiraUpdates } from '../services/Jiraservices';

// Mission 4: Status colors + Side Quest
const statusColors = {
  'To Do': 'default',
  'In Progress': 'primary',
  'Done': 'success'
};

const priorityColors = {
  'Highest': 'error',
  'High': 'error',
  'Medium': 'warning',
  'Low': 'info',
  'Lowest': 'info',
  'None': 'default'
};

export default function JiraWidget() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // Mission 5: Auto-refresh
  useEffect(() => {
    const unsubscribe = subscribeToJiraUpdates(
      (err, data) => {
        if (err) {
          setError(err.message);
          setLoading(false);
        } else {
          setIssues(data);
          setError(null);
          setLoading(false);
        }
      }
    );
    return unsubscribe;
  }, []);

  // Side Quest: Group by status
  const filteredIssues = statusFilter === 'All'
    ? issues
    : issues.filter(issue => issue.status === statusFilter);

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          My Jira Tasks
        </Typography>

        {/* Mission 4: Status filter */}
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, newFilter) => setStatusFilter(newFilter)}
          sx={{ mb: 2 }}
          size="small"
        >
          {['All', 'To Do', 'In Progress', 'Done'].map(status => (
            <ToggleButton key={status} value={status}>
              {status}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {loading && <LinearProgress />}
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Mission 4: Issues list */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {filteredIssues.map((issue, index) => (
            <React.Fragment key={issue.id}>
              {index > 0 && <Divider sx={{ my: 1.5 }} />}
              <Box>
                <Link 
                  href={issue.url} 
                  target="_blank" 
                  rel="noopener"
                  underline="hover"
                >
                  <Typography fontWeight="medium">
                    {issue.key}: {issue.summary}
                  </Typography>
                </Link>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Status">
                    <Chip
                      label={issue.status}
                      size="small"
                      color={statusColors[issue.status] || 'default'}
                    />
                  </Tooltip>
                  <Tooltip title="Priority">
                    <Chip
                      label={issue.priority}
                      size="small"
                      color={priorityColors[issue.priority]}
                    />
                  </Tooltip>
                  <Tooltip title="Project">
                    <Chip
                      label={issue.project}
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                </Box>
              </Box>
            </React.Fragment>
          ))}

          {!loading && filteredIssues.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No issues found
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}