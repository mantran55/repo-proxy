const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors()); // cho phép mọi origin (hoặc cors({ origin: 'https://<username>.github.io' }))
app.use(express.text({ type: '*/*' })); // nhận text/plain|json

// Thay bằng Web App URL (đuôi /exec) của bạn:
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxVNB13AYRoEw0m1oYG4Pwu7876-vZzQyLLYU8zcmdHiDvKJgx7tfwOpPHrJnc1vdGF8g/exec';

app.post('/api', async (req, res) => {
  const path = req.query.path || '';
  try {
    const r = await fetch(`${GAS_URL}?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // tránh preflight
      body: req.body || '{}'
    });
    const text = await r.text();
    res.status(r.status).set('Content-Type', 'application/json').send(text);
  } catch (e) {
    res.status(500).json({ ok:false, message:String(e) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, ()=> console.log(`Proxy on :${port}`));
