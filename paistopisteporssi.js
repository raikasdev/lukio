const loadAll = window.LOAD_ALL_PRODUCTS || false;
const featuredProducts = [
  "Juusto-pekonisämpylä",
  "Kinkku-juustocroissant",
  "Valkosipulivoipatonki",
];

const simpleHash = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  // Convert to 32bit unsigned integer in base 36 and pad with "0" to ensure length is 7.
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

async function processData(data, prices) {
  const { lastUpdated, changes } = data;
  const products = loadAll
    ? Object.keys(changes).map((i) => ({ name: i, ...changes[i] }))
    : featuredProducts.map((product) => ({
        name: product,
        ...changes[product],
      }));
  const container = document.querySelector("#lidl-prices");
  const order = { down: 0, neutral: 1, up: 2 };
  container.innerHTML = products
    .sort((a, b) => order[a.direction] - order[b.direction])
    .map(({ name, text, direction }) => {
    const image = prices.find((p) => p.fullTitle === name).image;
    const price = prices.find((p) => p.fullTitle === name).price;
    const icon =
      direction === "up"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="lucide lucide-trending-up">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>`
        : direction === "down"
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="lucide lucide-trending-down">
                  <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                  <polyline points="16 17 22 17 22 11" />
                </svg>`
          : "";
    return `<div class="product">
            <img alt="${name}" loading="lazy" width="280" height="210"
              src="${image}">
            <div class="product-info">
              <h3>${name}</h3>
              <p class="price trend-${direction}">
                ${price.toLocaleString("fi", { currency: "EUR", style: "currency" })}
                ${icon} 
              </p>
              <p class="history">${text}
              </p>
            </div>
          </div>`;
  }).join("\n");
  document.querySelector('#lidl-last-updated').innerHTML = new Date(lastUpdated).toLocaleDateString('fi');
}

async function run() {
  const changes = await loadCachedAPI("https://paistopiste.raikas.dev/price-changes.json");
  const prices = await loadCachedAPI("https://paistopiste.raikas.dev/prices.json");

  processData(changes, prices);
}

run();

