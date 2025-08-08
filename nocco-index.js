 const simpleHash = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    // Convert to 32bit unsigned integer in base 36 and pad with "0" to ensure >
    return (hash >>> 0).toString(36).padStart(7, '0');
  };
 async function loadCachedAPI(url) {
    // Cache that lasts until 9:30 AM tomorrow
    const cacheKey = `paistopiste-cache-${simpleHash(url)}`;
    const cache = window.localStorage.getItem(cacheKey);
    if (cache) {
      const { expires, data } = JSON.parse(cache);
      if (new Date(expires) > new Date()) {
        return data;
      }
    }
  
    const res = await fetch(url);
    const data = await res.json();
    const expires = new Date();
    expires.setHours(9, 30, 0, 0);
    expires.setDate(expires.getDate() + 1);
  
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({ expires, data }),
    );
  
    return data;
  }

(async () => {
  const res = await loadCachedAPI('https://jamsanlukio.fi/hintahistoria/output/nocco.json');

  document.querySelector('#nocco-index').innerHTML = `<p class="nocco-index">${res.price.toString().replace('.', ',')} €</p><p class="nocco-where">Kaupasta ${res.store}</p>`;
})();
