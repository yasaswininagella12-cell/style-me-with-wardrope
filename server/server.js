import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');

const readJson = (name) =>
  JSON.parse(readFileSync(join(dataDir, `${name}.json`), 'utf-8'));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const wrap = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

app.get('/api/health', wrap((req, res) => {
  res.json({ status: 'ok', service: 'StyleMe API', time: new Date().toISOString() });
}));

app.get('/api/steps', wrap((req, res) => res.json(readJson('steps'))));
app.get('/api/features', wrap((req, res) => res.json(readJson('features'))));
app.get('/api/outfits', wrap((req, res) => res.json(readJson('outfits'))));
app.get('/api/stats', wrap((req, res) => res.json(readJson('stats'))));
app.get('/api/testimonials', wrap((req, res) => res.json(readJson('testimonials'))));

const CHAT_REPLIES = [
  "Love that! Pair it with something in your Style Formula palette and you're golden. ✨",
  "Great question! For that, I'd suggest a relaxed blazer + the silk top you already own.",
  "Check your Outfit Calendar — I already styled 3 looks for you this week! 🗓️",
  "That piece gets a 9/10 for you. Add gold accessories and it's a 10. 💛",
  "Ooh, bold move! Confidence is the best accessory — go with the monochrome look. 🖤",
  "Let me check your capsule… yes! The beige trench over your black jumpsuit would be stunning.",
];

app.post('/api/chat', wrap((req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A message is required.' });
  }
  const reply = CHAT_REPLIES[Math.floor(Math.random() * CHAT_REPLIES.length)];
  setTimeout(() => {
    res.json({ reply, received: message });
  }, 500);
}));

const subscribers = [];

app.post('/api/newsletter', wrap((req, res) => {
  const { email } = req.body || {};
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
  if (!valid) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  subscribers.push({ email, subscribedAt: new Date().toISOString() });
  res.status(201).json({ success: true, message: 'You are on the list!' });
}));

app.get('/api/subscribers', wrap((req, res) => res.json(subscribers)));

const clientDist = join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(join(clientDist, 'index.html'), (err) => { if (err) next(); });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`StyleMe API running at http://localhost:${PORT}`);
});
