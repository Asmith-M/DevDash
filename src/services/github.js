// src/services/github.js
const GITHUB_API = "https://api.github.com";

// Base fetching function with auth headers
const fetchFromGitHub = async (url, accessToken) => {
  const headers = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.error(`GitHub API Error: ${res.status} ${res.statusText}`);

    if (res.status === 403) {
      const rateLimitRemaining = res.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining === '0') {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Access denied. ${!accessToken ? 'GitHub authentication required.' : 'Insufficient permissions.'}`);
      }
    }

    if (res.status === 404) {
      throw new Error('Resource not found on GitHub.');
    }

    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

// Fetch user repositories
export const fetchUserRepos = async (username, accessToken) => {
  try {
    console.log(`Fetching repos for ${username} with token: ${accessToken ? "Present" : "Missing"}`);

    return await fetchFromGitHub(`${GITHUB_API}/users/${encodeURIComponent(username)}/repos`, accessToken);
  } catch (error) {
    console.error("Error fetching user repos:", error);
    throw error;
  }
};

// Fetch weekly commits for a repository
export const fetchWeeklyCommitsForRepo = async (username, repo, accessToken) => {
  try {
    console.log(`Fetching commits for ${username}/${repo} with token: ${accessToken ? "Present" : "Missing"}`);

    const res = await fetch(
      `${GITHUB_API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/stats/commit_activity`,
      {
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
      }
    );

    if (res.status === 202) {
      // GitHub is computing statistics
      console.log("GitHub is computing statistics, try again in a moment");
      return [];
    }

    if (!res.ok) {
      if (res.status === 404) {
        console.log(`Repository ${username}/${repo} not found or not accessible`);
        return [];
      }

      throw new Error(`Failed to fetch commit stats for ${username}/${repo} (${res.status} ${res.statusText})`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching weekly commits:", error);
    throw error;
  }
};

// New: Connect to real-time webhook events
let eventSource = null;
const eventListeners = new Set();

export const connectToWebhookEvents = () => {
  if (eventSource) {
    // Already connected
    return;
  }

  // Use your deployed Vercel URL here (or local for dev)
  const apiUrl = window.NEXT_PUBLIC_API_URL || window.location.origin; // Access through window
  eventSource = new EventSource(`${apiUrl}/api/github-webhook`);

  eventSource.onopen = () => {
    console.log('Connected to GitHub webhook events');
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // Ignore ping messages
      if (data.type === 'ping') return;

      console.log('Received webhook event:', data);

      // Notify all listeners
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (err) {
          console.error('Error in event listener:', err);
        }
      });
    } catch (err) {
      console.error('Error parsing webhook event:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('EventSource error:', err);
    // Try to reconnect after a delay
    setTimeout(() => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
        connectToWebhookEvents();
      }
    }, 5000);
  };
};

export const disconnectFromWebhookEvents = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log('Disconnected from GitHub webhook events');
  }
};

export const addWebhookEventListener = (listener) => {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
};

// Fetch recent webhook events (for initial load)
export const fetchRecentEvents = async () => {
  try {
    const apiUrl = window.NEXT_PUBLIC_API_URL || window.location.origin; // Access through window
    const res = await fetch(`${apiUrl}/api/github-webhook?data=true`);
    if (!res.ok) {
      throw new Error(`Failed to fetch recent events: ${res.status}`);
    }
    const data = await res.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching recent events:', error);
    return [];
  }
};