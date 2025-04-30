// RepoStats.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Typography, Button, Chip, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { motion } from 'framer-motion';
import { fetchUserRepos } from '../services/github';
import { useAuth } from '../auth/AuthProvider';

const RepoStats = ({ username }) => {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('stars');

  console.log("RepoStats User Object:", user); // Add this line

  const loadRepos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const repoList = await fetchUserRepos(username, user?.githubAccessToken);
      setRepos(repoList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [username, user?.githubAccessToken]);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const sortedRepos = [...repos].sort((a, b) => {
    let valueA = 0;
    let valueB = 0;

    if (sortOption === 'stars') {
      valueA = a.stargazers_count;
      valueB = b.stargazers_count;
    } else if (sortOption === 'forks') {
      valueA = a.forks_count;
      valueB = b.forks_count;
    } else if (sortOption === 'updated') {
      valueA = new Date(a.updated_at).getTime();
      valueB = new Date(b.updated_at).getTime();
    }

    return valueB - valueA;
  }).slice(0, 5);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Typography variant="h6">Top Repositories</Typography>
        <FormControl size="small">
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by"
            value={sortOption}
            onChange={handleSortChange}
          >
            <MenuItem value="stars">Stars</MenuItem>
            <MenuItem value="forks">Forks</MenuItem>
            <MenuItem value="updated">Last Updated</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {sortedRepos.map(repo => (
          <motion.div
            key={repo.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card sx={{ width: 300 }}>
              <CardContent>
                <Typography variant="h6">{repo.name}</Typography>
                <Typography variant="body2">⭐ Stars: {repo.stargazers_count}</Typography>
                <Typography variant="body2">🍴 Forks: {repo.forks_count}</Typography>
                <Typography variant="body2">
                  🕒 Updated: {new Date(repo.updated_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Languages:
                </Typography>
                <Box sx={{ display: 'flex', gap: '0.5rem', mt: 0.5 }}>
                  {repo.languages_url && (
                    <React.Suspense fallback={<>Loading Languages...</>}>
                      <LanguageChips url={repo.languages_url} />
                    </React.Suspense>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
};

const LanguageChips = ({ url }) => {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchLangs = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        const topLangs = Object.keys(data).slice(0, 2);
        setLanguages(topLangs);
      } catch (error) {
        console.error("Error fetching languages:", error);
        setLanguages([]);
      }
    };

    fetchLangs();
  }, [url]);

  return (
    <>
      {languages.map(lang => (
        <Chip key={lang} label={lang} size="small" style={{ margin: '2px' }} />
      ))}
    </>
  );
};

export default RepoStats;