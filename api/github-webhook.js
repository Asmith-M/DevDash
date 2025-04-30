// api/github-webhook.js
import crypto from 'crypto';

// In-memory store for events (replace with database in production)
let githubEvents = [];
let connectedClients = new Set();

export default async function handler(req, res) {
  // CORS headers for SSE connections
  if (req.method === 'GET') {
    return handleSSEConnection(req, res);
  }
  
  // Handle webhook POST from GitHub
  if (req.method === 'POST') {
    return handleWebhook(req, res);
  }

  // Return events (for initial data load)
  if (req.method === 'GET' && req.query.data === 'true') {
    return res.status(200).json({ events: githubEvents.slice(-10) });
  }

  res.status(405).json({ error: 'Method not allowed' });
}

function handleSSEConnection(req, res) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial ping to establish connection
  res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
  
  // Add this client to our connected clients
  const clientId = Date.now();
  connectedClients.add(res);
  
  // Remove client when connection closes
  req.on('close', () => {
    connectedClients.delete(res);
  });
}

async function handleWebhook(req, res) {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    return res.status(401).json({ error: 'No signature provided' });
  }

  // Verify webhook signature if you have a secret configured
  // Uncomment and replace YOUR_WEBHOOK_SECRET with your actual secret
  /*
  const payload = await getRawBody(req);
  if (!verifySignature(payload, signature, process.env.GITHUB_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  */
  
  const event = {
    id: crypto.randomUUID(),
    type: req.headers['x-github-event'],
    timestamp: new Date().toISOString(),
    payload: req.body
  };

  // Process different event types
  switch (event.type) {
    case 'push':
      handlePushEvent(event);
      break;
    case 'star':
      handleStarEvent(event);
      break;
    case 'repository':
      handleRepoEvent(event);
      break;
    // Add more event handlers as needed
  }

  // Store the event (limit to 100 recent events)
  githubEvents.unshift(event);
  if (githubEvents.length > 100) {
    githubEvents = githubEvents.slice(0, 100);
  }

  // Notify all connected clients about the new event
  broadcastEvent(event);

  res.status(200).json({ success: true });
}

function handlePushEvent(event) {
  const repo = event.payload.repository.name;
  const branch = event.payload.ref.replace('refs/heads/', '');
  const commits = event.payload.commits || [];
  
  event.summary = {
    repo,
    branch,
    commits: commits.length,
    message: `${commits.length} new commit(s) pushed to ${repo}/${branch}`
  };
}

function handleStarEvent(event) {
  const repo = event.payload.repository.name;
  const action = event.payload.action; // 'created' for new star
  
  event.summary = {
    repo,
    action,
    message: `Repository ${repo} ${action === 'created' ? 'starred' : 'unstarred'}`
  };
}

function handleRepoEvent(event) {
  const repo = event.payload.repository.name;
  const action = event.payload.action;
  
  event.summary = {
    repo,
    action,
    message: `Repository ${repo} was ${action}`
  };
}

function broadcastEvent(event) {
  // Send the event to all connected clients
  for (const client of connectedClients) {
    client.write(`data: ${JSON.stringify(event)}\n\n`);
  }
}

// Helper to verify GitHub webhook signatures
function verifySignature(payload, signature, secret) {
  const sig = Buffer.from(signature || '', 'utf8');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from('sha256=' + hmac.update(payload).digest('hex'), 'utf8');
  return crypto.timingSafeEqual(sig, digest);
}

// Helper to get raw request body for signature verification
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const bodyParts = [];
    req.on('data', (chunk) => {
      bodyParts.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(bodyParts).toString());
    });
    req.on('error', reject);
  });
}