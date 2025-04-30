import axios from 'axios';

export default async (req, res) => {
  // Mission 3: Secure backend proxy
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const response = await axios.get(
      `https://${process.env.JIRA_DOMAIN}/rest/api/3/search`,
      {
        params: {
          jql: 'assignee=currentUser() ORDER BY status ASC',
          fields: 'summary,status,issuetype,project,priority,created'
        },
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN
        }
      }
    );

    // Mission 3: Simplified response
    const issues = response.data.issues.map(issue => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      priority: issue.fields.priority?.name || 'None',
      type: issue.fields.issuetype.name,
      project: issue.fields.project.name,
      created: issue.fields.created,
      url: `https://${process.env.JIRA_DOMAIN}/browse/${issue.key}`
    }));

    res.status(200).json(issues);
  } catch (error) {
    console.error('Jira API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch issues',
      details: error.response?.data?.message || error.message 
    });
  }
};