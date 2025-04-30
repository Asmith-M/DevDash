// Mission 4: API Service
export const fetchJiraIssues = async () => {
    try {
      const response = await fetch('/api/jira');
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      console.error('Jira service error:', error);
      throw new Error(error.message || 'Failed to fetch Jira issues');
    }
  };
  
  // Mission 5: Auto-refresh
  export const subscribeToJiraUpdates = (callback, interval = 30000) => {
    const fetchData = async () => {
      try {
        const data = await fetchJiraIssues();
        callback(null, data);
      } catch (error) {
        callback(error);
      }
    };
  
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, interval);
    
    return () => clearInterval(intervalId);
  };