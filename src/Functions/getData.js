import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function readAllLogsFromFiles() {
  const logsDir = path.join(__dirname, '..', 'Logs');

  try {
    await fs.access(logsDir);
  } catch (err) {
    console.warn('Logs directory not found, returning empty array:', err.message);
    return []; // No logs dir yet
  }

  const files = await fs.readdir(logsDir);
  // Lọc file theo pattern YYYY-MM-DD-hh-mm-ss-ACTION.ndjson
  const ndjsonFiles = files.filter(f => 
    f.endsWith('.ndjson') && 
    /^(\d{4}-\d{2}-\d{2})-(\d{2}-\d{2}-\d{2})-[A-Z_]+(\.ndjson)$/.test(f)
  );

  const all = [];
  for (const file of ndjsonFiles) {
    const fp = path.join(logsDir, file);
    try {
      const raw = await fs.readFile(fp, 'utf-8');
      const lines = raw.trim().split('\n').filter(line => line.trim().length > 0);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          all.push(parsed);
        } catch (e) {
          console.warn(`Skipping invalid line in ${file}: ${e.message}`);
        }
      }
    } catch (e) {
      console.warn(`Skipping broken log file ${file}: ${e.message}`);
    }
  }

  // Sắp xếp theo timestamp để đảm bảo thứ tự thời gian
  all.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return all;
}