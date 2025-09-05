// server.js  ✅ phiên bản OK cho Render
const express = require('express');
const fetch = require('node-fetch');          // v2
const app = express();

// --- CONFIG ---
const ALLOW_ORIGIN = ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://<username>.github.io']; // thêm domain FE
const GAS_URL = 'https://script.google.com/macros/s/AKfycbys12umaYX0G-blpuc59OHwtFff5TqAf1Xk_mF0_tGCCs6nBwnt9vFdKgiF3uKbKGp_yg/exec'; // /exec

// middlewares
app.use(express.text({ type: '*/*' }));       // nhận text/plain|json

// CORS cho mọi request (kể cả OPTIONS)
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allow = ALLOW_ORIGIN.includes(origin) ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Nếu chỉ định allow != '*' và cần cookie -> thêm: res.setHeader('Access-Control-Allow-Credentials','true');

  if (req.method === 'OPTIONS') {
    // Trả ngay cho preflight
    return res.status(204).end();
  }
  next();
});

// handler chung
async function forward(req, res) {
  const path = req.query.path || '';
  try {
    const r = await fetch(`${GAS_URL}?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // tránh preflight ở bước sau
      body: req.body || '{}'
    });
    const text = await r.text();
    res.status(r.status).set('Content-Type', 'application/json').send(text);
  } catch (e) {
    res.status(500).json({ ok:false, message:String(e) });
  }
}

// chấp nhận cả "/" và "/api"
app.post('/', forward);
app.post('/api', forward);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Proxy running on :${port}`));

