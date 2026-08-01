/* Multi-source web search override – 8 sources, parallel */
async function fetchWebAnswer(question) {
  const q = question.trim();
  const topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;

  const sources = [
    'https://r.jina.ai/https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic),
    'https://r.jina.ai/https://en.wikipedia.org/wiki/' + encodeURIComponent(topic),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:hu.wikipedia.org'),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' magyarázat'),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(q),
    'https://r.jina.ai/https://www.bing.com/search?q=' + encodeURIComponent(q + ' magyar'),
    'https://r.jina.ai/https://www.bing.com/search?q=' + encodeURIComponent(q),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció')
  ];

  const fetches = sources.map(async (url) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(url, {
        headers: { Accept: 'text/plain' },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) return null;
      const raw = await response.text();
      const marker = raw.includes('Markdown Content:') ? raw.split('Markdown Content:')[1] : raw;
      const useful = (typeof extractUsefulSentences === 'function')
        ? extractUsefulSentences(marker, 300)
        : null;
      if (useful && useful.length > 50) return useful;
    } catch (e) {}
    return null;
  });

  const settled = await Promise.allSettled(fetches);
  const results = [];
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value) results.push(s.value);
  }
  if (!results.length) return null;

  const combined = [];
  const seen = new Set();
  for (const r of results) {
    const key = r.slice(0, 50).toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(r);
    if (combined.join(' ').length >= 520) break;
    if (combined.length >= 5) break;
  }
  return combined.join(' ').slice(0, 560);
}
