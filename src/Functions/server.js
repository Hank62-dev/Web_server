import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loggingMiddleware, getLogs } from './logs.js';
import { readAllLogsFromFiles } from './getData.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import UserSchema from '../Database/Users.js'; // Import User model

dotenv.config({ path: path.resolve('D:/DEV/webServer/Web_server/src/Functions/.env') });
console.log("MONGOOSE_URI:", process.env.MONGOOSE_URI);

const mongoURL = process.env.MONGOOSE_URI;

if (!mongoURL) {
  console.log("No URI Provided, Could Not Connect To Database");
} else {
  mongoose.connect(mongoURL, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log("Database Connected Successfully!");
  }).catch((err) => {
    console.error("Database Connection Failed:", err.message);
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '..', 'Logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
const pagesDir = path.join(__dirname, '..', 'pages');
app.use(express.static(pagesDir, {
  extensions: ['html', 'css'],
}));

// Attach logging middleware
app.use(loggingMiddleware);

// POST /register - Sử dụng MongoDB
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await UserSchema.findOne({ UserName: username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await UserSchema.findOne({ Email: email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new UserSchema({
      UserName: username,
      Email: email,
      Password: hashedPassword
    });

    await newUser.save();

    return res.json({ 
      message: 'User registered successfully',
      username: username 
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /login - Sử dụng MongoDB
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Tìm user trong database
    const user = await UserSchema.findOne({ UserName: username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // So sánh password đã mã hóa
    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (isPasswordValid) {
      return res.json({ 
        message: 'Login successful',
        username: user.UserName,
        email: user.Email
      });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /logs
app.get('/logs', (req, res) => {
  res.json(getLogs());
});

// Serve specific pages
app.get('/', (req, res) => {
  res.redirect('/page_login');
});

app.get('/page_login', (req, res) => {
  res.sendFile(path.join(pagesDir, 'page_login', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(pagesDir, 'page_registration', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await readAllLogsFromFiles();
    console.log('Logs loaded from files');
  } catch (err) {
    console.error('Failed to preload logs:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/page_login in browser`);
  });
}

start();