import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loggingMiddleware, getLogs } from './logs.js';
import { readAllLogsFromFiles } from './getData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '..', 'Logs');
  if(!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
  }
  
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the /pages directory and its subdirectories
const pagesDir = path.join(__dirname, '..', 'pages');
app.use(express.static(pagesDir, {
  extensions: ['html', 'css'], // Explicitly allow serving .html and .css files
}));

// Attach logging middleware
app.use(loggingMiddleware);

// POST /register
app.post('/register', (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const exists = getLogs().find(
    l => l.request && l.request.action === 'REGISTER' && l.request.body.username === username
  );
  if (exists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  return res.json({ message: 'User registered successfully' });
});

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const user = getLogs().find(
    l => l.request && l.request.action === 'REGISTER' && l.request.body.username === username && l.request.body.password === password
  );

  if (user) {
    return res.json({ message: 'Login successful' });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// GET /logs
app.get('/logs', (req, res) => {
  res.json(getLogs());
});

// Serve specific pages by redirecting to their directories
app.get('/', (req, res) => {
  res.redirect('/page_login');
});

app.get('/page_login', (req, res) => {
  res.sendFile(path.join(pagesDir, 'page_login', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(pagesDir, 'page_registration', 'index.html'));
});

// --- Start server ---
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await readAllLogsFromFiles(); // Preload logs from files
  } catch (err) {
    console.error('Failed to preload logs:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/page_login in browser`);
  });
}

start();