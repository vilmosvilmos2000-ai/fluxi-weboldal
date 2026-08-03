/**
 * Vercel Serverless Function – VilmosGPT chat proxy
 * Kulcs csak process.env – soha nem a böngészőben.
 */

const ALLOWED_ORIGINS = [
  'https://fluxi.hu',
  'https://www.fluxi.hu',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
];

const STRICT_SYSTEM_HU =
  'Te vagy Vilmos GPT, egy rendkívül intelligens és segítőkész magyar nyelvű AI asszisztens. ' +
  'A feladatod, hogy lényegretörő, pontos és emberi válaszokat adj. ' +
  'Szakértő vagy a webfejlesztésben (HTML, CSS, JS), a Roblox Luau programozásban, ' +
  'a videójátékokban (Fortnite) és az elektromos rollerek (pl. Kukirin G2) szerelésében, beállításaiban.\n' +
  'SZIGORÚ SZABÁLYOK:\n' +
  '- SOHA ne adj vissza nyers HTML kódot, weboldal menüket, navigációs linkeket, vagy keresési metaadatokat!\n' +
  '- SOHA ne idézz Wikipédia oldalsávot, nyomtatási menüt, „Fájl feltöltése”, „Lapinformációk” típusú szöveget!\n' +
  '- Ha nem tudod a választ, mondd azt, hogy: Sajnos ezt nem tudom.\n' +
  '- Mindig Markdown formátumot használj az átláthatóságért (félkövér, lista, kódblokk ha kell).\n' +
  '- Válaszolj magyarul, kivéve ha a felhasználó angolul ír.\n' +
  '- Légy konkrét és hasznos; ne találj ki műszaki adatokat.';

const STRICT_SYSTEM_EN =
  'You are Vilmos GPT, a highly capable helpful AI assistant. ' +
  'Expert in web development (HTML, CSS, JS), Roblox Luau, games (Fortnite), and electric scooters (e.g. Kukirin G2).\n' +
  'STRICT RULES:\n' +
  '- NEVER return raw HTML, website menus, navigation chrome, or search metadata.\n' +
  '- NEVER quote Wikipedia sidebars, print menus, or UI chrome text.\n' +
  '- If you do not know, say: Sorry, I do not know that.\n' +
  '- Always use Markdown for clarity.\n' +
  '- Reply in English when the user writes in English.';

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?fluxi\.hu$/i.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
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
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function isScraperJunk(text) {
  const s = String(text || '').toLowerCase();
  if (!s || s.length < 8) return true;
  const bad = [
    'javascript:print', 'lapinformációk', 'lapinformaciok', 'fájl feltöltése', 'fajl feltoltese',
    'nyomtatható változat', 'nyomtathato valtozat', 'page contents not supported',
    'navigation menu', 'skip to content', 'wikimédia commons', 'wikimedia commons',
    'edit source', 'view history', 'create account', 'sign in', 'cookie policy',
    'markdown content:', 'article wizard', 'submit a draft'
  ];
  return bad.some((b) => s.includes(b));
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
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
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY nincs beállítva a szerveren.' }));
    return;
  }

  let body;
  try { body = await readBody(req); }
  catch (e) {
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

  const systemExtra = '\nAktív mód: ' + mode + '.';
  const messages = [
    { role: 'system', content: (lang === 'en' ? STRICT_SYSTEM_EN : STRICT_SYSTEM_HU) + systemExtra }
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
        temperature: 0.5,
        max_tokens: 900
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Az AI szolgáltató hibát adott.',
        detail: (data && data.error && data.error.message) || 'unknown'
      }));
      return;
    }

    let reply =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
      data.reply ||
      '';
    reply = String(reply).trim();

    if (isScraperJunk(reply)) {
      reply = lang === 'en'
        ? 'Error: The AI returned an invalid format. Please try again!'
        : 'Hiba: Az AI rossz formátumban válaszolt, kérlek próbáld újra!';
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ reply }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Szerver hiba a chat hívás közben.' }));
  }
};
