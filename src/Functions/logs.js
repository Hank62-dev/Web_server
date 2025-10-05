import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logs = [];
let isSaving = false; // Flag để khóa quá trình ghi

async function ensureLogsDir() {
  const logsDir = path.join(__dirname, '..', 'Logs');
  if(!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
  }
  try {
    await fs.mkdir(logsDir, { recursive: true });
    console.log('Logs directory ensured at:', logsDir); // Debug thư mục
  } catch (e) {
    console.error('Failed to ensure Logs directory:', e.message);
  }
  return logsDir;
}

async function saveEntryToFile(entry) {
  while (isSaving) {
    await new Promise(resolve => setTimeout(resolve, 10)); // Chờ nếu đang ghi
  }

  isSaving = true;
  const logsDir = await ensureLogsDir();
  const now = new Date(); // Lấy thời gian hiện tại
  const dateTime = now.toISOString().replace(/:/g, '-').split('.')[0]; // YYYY-MM-DDTHH-MM-SS
  console.log('Current dateTime for file:', dateTime); // Debug thời gian
  const logFile = path.join(logsDir, `${dateTime}.json`);
  const tempFile = `${logFile}.tmp`;

  if (!entry || typeof entry !== 'object') {
    console.warn('Invalid entry, skipping:', entry);
    isSaving = false;
    return;
  }

  try {
    const jsonData = JSON.stringify([entry], null, 2);
    console.log('Attempting to write to file:', logFile, 'with data:', jsonData); // Debug trước khi ghi
    await fs.writeFile(tempFile, jsonData, 'utf-8');
    console.log('Temp file written, renaming to:', logFile); // Debug sau khi ghi
    await fs.rename(tempFile, logFile);
    console.log('File successfully written:', logFile); // Debug thành công
  } catch (err) {
    console.error('Error saving log:', err.message, 'Stack:', err.stack); // Debug lỗi chi tiết
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      console.error('Failed to clean up temp file:', e.message);
    }
  }

  isSaving = false;
}

export function getLogs() {
  return logs;
}

export function loggingMiddleware(req, res, next) {
  const { method, url, headers, body } = req;

  console.log('Middleware called for method:', method, 'URL:', url, 'Body:', body); // Debug gọi middleware và body

  if (method !== 'GET' && method !== 'POST') {
    return next();
  }

  let action = 'UNKNOWN';
  if (url === '/register') action = 'REGISTER';
  else if (url === '/login') action = 'LOGIN';
  else if (url === '/logs') action = 'GET_LOGS';

  console.log('URL:', url, 'Assigned action:', action); // Debug URL và action

  if (action === 'UNKNOWN') {
    console.log('Skipping due to unknown action for URL:', url);
    return next();
  }

  const reqEntry = {
    type: 'REQUEST',
    action,
    method,
    path: url,
    headers: { 'Content-Type': headers['content-type'] || null },
    body: body || {},
    timestamp: new Date().toISOString()
  };

  console.log('Request Entry:', reqEntry);
  logs.push(reqEntry);

  const oldJson = res.json.bind(res);
  const oldSend = res.send.bind(res);

  function writeResponseEntry(bodyToWrite) {
    const resEntry = {
      type: 'RESPONSE',
      action,
      method,
      statusCode: res.statusCode,
      body: bodyToWrite || {},
      timestamp: new Date().toISOString()
    };

    const combinedEntry = {
      request: reqEntry,
      response: resEntry
    };

    console.log('Combined Entry:', combinedEntry);
    logs.push(resEntry);
    saveEntryToFile(combinedEntry).catch((err) => console.error('Error in saveEntryToFile:', err.message));
  }

  res.json = function(data) {
    const ret = oldJson(data);
    writeResponseEntry(data);
    return ret;
  };

  res.send = function(data) {
    const ret = oldSend(data);
    writeResponseEntry(data);
    return ret;
  };

  next();
}