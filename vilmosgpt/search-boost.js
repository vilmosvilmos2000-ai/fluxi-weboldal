/* Multi-source web search – research mode: 20+ sources */
async function fetchWebAnswer(question) {
  const q = question.trim();
  const topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;

  const deep = (typeof currentMode !== 'undefined' && currentMode === 'research');
  const j = (url) => 'https://r.jina.ai/' + url;

  // Alap források (minden mód)
  const baseSources = [
    j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://en.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' magyarázat')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(q + ' magyar')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(q)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:hu.wikipedia.org'))
  ];

  // Kutatás mód: legalább 20+ forrás
  const researchSources = [
    j('https://simple.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://www.britannica.com/search?query=' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:index.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:telex.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:24.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:hvg.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:wikipedia.org')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:edu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' explained')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' definition')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' jelentése')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' magyarázat egyszerűen')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(q + ' explanation')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(topic + ' what is')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:reddit.com')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:stackoverflow.com')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:quora.com')),
    j('https://en.wiktionary.org/wiki/' + encodeURIComponent(topic)),
    j('https://hu.wiktionary.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' összefoglaló')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' tények')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(q + ' site:gov'))
  ];

  const sources = deep ? baseSources.concat(researchSources) : baseSources;
  const timeoutMs = deep ? 8000 : 6000;
  const maxSnippets = deep ? 12 : 5;
  const maxLen = deep ? 1100 : 560;
  const perSourceLen = deep ? 280 : 300;

  const fetches = sources.map(async (url) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        headers: { Accept: 'text/plain' },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) return null;
      const raw = await response.text();
      const marker = raw.includes('Markdown Content:') ? raw.split('Markdown Content:')[1] : raw;
      const useful = (typeof extractUsefulSentences === 'function')
        ? extractUsefulSentences(marker, perSourceLen)
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

  // Legjobb, ismétlés nélküli részek összerakása
  const combined = [];
  const seen = new Set();
  for (const r of results) {
    const key = r.slice(0, 60).toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(r);
    if (combined.join(' ').length >= maxLen) break;
    if (combined.length >= maxSnippets) break;
  }

  let answer = combined.join(' ').slice(0, maxLen).trim();
  if (deep && results.length) {
    const srcCount = results.length;
    answer = answer + '\n\n(Összefoglalva ' + srcCount + ' forrásból.)';
  }
  return answer;
}
