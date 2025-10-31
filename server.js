// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// serve static files from current directory
app.use(express.static(__dirname, { extensions: ['html'] }));

const JSON_PATH = path.join(__dirname, "videos.json");

// Helper pro bezpečné čtení JSON pole
function readVideos() {
  try {
    if (!fs.existsSync(JSON_PATH)) return [];
    const raw = fs.readFileSync(JSON_PATH, "utf8").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('readVideos error', err);
    return [];
  }
}

// Helper pro zápis
function writeVideos(arr) {
  try {
    fs.writeFileSync(JSON_PATH, JSON.stringify(arr, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error('writeVideos error', err);
    return false;
  }
}

app.post("/add-video", (req, res) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) return res.status(400).send("Missing title or url");

    const videos = readVideos();
    // základní validace: unikátní URL?
    if (videos.some(v => v.url === url)) {
      return res.status(409).send("Video již existuje");
    }

    const item = { title: String(title), url: String(url) };
    videos.push(item);

    if (!writeVideos(videos)) {
      return res.status(500).send("Chyba při zápisu na server");
    }

    console.log('Added video:', item);
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Error in /add-video:", err);
    return res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server běží na http://localhost:${PORT}`));
