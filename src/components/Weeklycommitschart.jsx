import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Typography, Button, Box, Alert } from "@mui/material";
import { Refresh } from '@mui/icons-material';
import { fetchWeeklyCommitsForRepo } from '../services/github';
import { useAuth } from '../auth/AuthProvider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyCommitsChart = ({ username, repo }) => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  
  // Check if token exists in localStorage even if not in user object
  const getToken = () => {
    return user?.githubAccessToken || localStorage.getItem('githubAccessToken');
  };

  // Move loadCommits outside useEffect to avoid dependency issues
  const loadCommits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      console.log("Using token:", token ? "Token exists" : "No token found");
      
      if (!token) {
        setError("GitHub authentication required. Please log in with GitHub.");
        setLoading(false);
        return;
      }
      
      const weeklyData = await fetchWeeklyCommitsForRepo(username, repo, token);
      console.log("API Response for Commits:", weeklyData);

      // More extensive check for valid data
      if (!weeklyData || !Array.isArray(weeklyData) || weeklyData.length === 0) {
        console.log("No valid commit data returned");
        setChartData({
          labels: [],
          datasets: [{
            label: "Commits",
            backgroundColor: "#42a5f5",
            data: [],
          }]
        });
        return;
      }

      // Get last 4 weeks or use all if less than 4
      const weeks = weeklyData.slice(Math.max(0, weeklyData.length - 4));
      const labels = weeks.map((week, index) => {
        // Convert Unix timestamp to date if it exists
        if (week.week) {
          const date = new Date(week.week * 1000);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }
        return `Week ${index + 1}`;
      });
      
      const commits = weeks.map(week => week.total || 0);

      setChartData({
        labels,
        datasets: [{
          label: "Commits",
          backgroundColor: "#42a5f5",
          data: commits,
        }]
      });
    } catch (err) {
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username && repo) {
      loadCommits();
    }
  }, [username, repo, user?.githubAccessToken]); // keep these dependencies

  const handleRefresh = () => {
    loadCommits();
  };

  if (loading) {
    return <Box p={2}>Loading commit data...</Box>;
  }
  
  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box display="flex" justifyContent="center">
          <Button 
            variant="contained" 
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }
  
  if (!chartData || !chartData.datasets[0].data.length) {
    return (
      <Box p={2}>
        <Alert severity="info">
          No commit data available for {username}/{repo}.
          {!getToken() && " You may need to authenticate with GitHub to access this data."}
        </Alert>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        </Box>
      </Box>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Commits: ${context.raw}`;
          }
        }
      }
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Typography variant="h6">Weekly Commits for {repo}</Typography>
        <Button onClick={handleRefresh} variant="outlined" size="small" startIcon={<Refresh />}>
          Refresh
        </Button>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} ref={chartRef} />
      </div>
    </>
  );
};

export default WeeklyCommitsChart;