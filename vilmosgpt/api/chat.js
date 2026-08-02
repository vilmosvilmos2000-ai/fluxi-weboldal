/**
 * Vercel Serverless Function – VilmosGPT chat proxy
 * A kulcs CSAK a szerveren él (process.env), soha nem a böngészőben.
 *
 * Deploy: vercel.com → Import repo → Environment Variables → OPENAI_API_KEY
 * Helyi: .env fájl + `vercel dev`
 */

const ALLOWED_ORIGINS = [
  'https://fluxi.hu',
  'https://www.fluxi.hu',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // GitHub Pages / saját domain – engedjük a fluxi.hu aldomaineket is
    if (/^https:\/\/([a-z0-9-]+\.)?fluxi\.hu$/i.test(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Csak POST engedélyezett.' }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'OPENAI_API_KEY nincs beállítva a szerveren. Állítsd be a Vercel Environment Variables között.'
    }));
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Érvénytelen JSON body.' }));
    return;
  }

  const message = String(body.message || body.text || '').trim();
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  const mode = String(body.mode || 'learn');
  const lang = body.lang === 'en' ? 'en' : 'hu';

  if (!message || message.length > 4000) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Üzenet kötelező (max 4000 karakter).' }));
    return;
  }

  const systemHu =
    'Te a VilmosGPT vagy, egy barátságos, rövid és világos magyar nyelvű AI segéd. ' +
    'Válaszolj magyarul, Markdown formázással (félkövér, lista, kód ha kell). ' +
    'Mód: ' + mode + '. Légy pontos, ne találj ki tényeket.';
  const systemEn =
    'You are VilmosGPT, a friendly, concise AI assistant. ' +
    'Reply in English with Markdown when useful. Mode: ' + mode + '. Be accurate.';

  const messages = [
    { role: 'system', content: lang === 'en' ? systemEn : systemHu }
  ];

  history.forEach((h) => {
    if (!h || !h.text) return;
    const role = h.role === 'user' ? 'user' : 'assistant';
    messages.push({ role, content: String(h.text).slice(0, 1500) });
  });
  messages.push({ role: 'user', content: message });

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.6,
        max_tokens: 800
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.statusCode = upstream.status === 401 ? 502 : 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Az AI szolgáltató hibát adott.',
        detail: (data && data.error && data.error.message) || 'unknown'
      }));
      return;
    }

    const reply =
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      '';

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ reply: String(reply).trim() }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Szerver hiba a chat hívás közben.' }));
  }
};
