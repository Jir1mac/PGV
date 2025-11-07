import express from 'express';
import serverless from 'serverless-http';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static('public', { extensions: ['html'] }));

const JSON_PATH = path.join(process.cwd(), 'videos.json');

function readVideos() {
  try {
    if (!fs.existsSync(JSON_PATH)) return [];
    const raw = fs.readFileSync(JSON_PATH, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVideos(arr) {
  try {
    fs.writeFileSync(JSON_PATH, JSON.stringify(arr, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

app.get('/api/videos', (req, res) => {
  res.json(readVideos());
});

app.post('/api/add-video', (req, res) => {
  const { title, url } = req.body || {};
  if (!title || !url) return res.status(400).json({ error: 'Missing title or url' });

  const videos = readVideos();
  if (videos.some(v => v.url === url)) {
    return res.status(409).json({ error: 'Video již existuje' });
  }

  const item = { title: String(title), url: String(url) };
  videos.push(item);
  if (!writeVideos(videos)) {
    return res.status(500).json({ error: 'Chyba při zápisu' });
  }
  res.json({ status: 'OK', added: item });
});

// Export pro Vercel místo app.listen()
export const handler = serverless(app);