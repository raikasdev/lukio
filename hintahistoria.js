(async () => {
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
  const data = await loadCachedAPI('https://jamsanlukio.fi/hintahistoria/output/prices.json');
  const products = Object.keys(data.products).map((i) => {
    // stores: { "S-Market Jämsä": { price: 1.99 }, "K-Market Jämsä": {price: 2.49 } }
    // Get the cheapest price and store it's in
    let stores = Object.keys(data.products[i].stores);
    stores.forEach((store) => {
      const { discounts } = data.products[i].stores[store];
      discounts.forEach((discount) => {
        data.products[i].stores[`${store} (${discount.type === 'kplussa' ? 'K-Plussa' : discount.type === 'kplussa_batch' ? `K-Plussa (${discount.batch}kpl)` : discount.type})`] = {
          price: discount.price,
        };
      });
    });
    stores = Object.keys(data.products[i].stores);
    const price = Math.min(...stores.map((store) => data.products[i].stores[store].price));
    const store = stores.find((store) => data.products[i].stores[store].price === price);

    return {
      name: i,
      ...data.products[i],
      price,
      cheapestStore: store,
    };
    // alphabetically sort
  }).sort((a, b) => a.name.localeCompare(b.name));

  document.querySelector('#product-prices').innerHTML = products.map((i) => `<div class="product" data-product-id="${simpleHash(i.name)}">
            <img alt="${i.name}" loading="lazy" height="210"
              src="${i.image}">
            <div class="product-info">
              <div class="product-text-info">
              <h3>${i.name}</h3>
              <p class="price">
                ${i.price} €
              </p>
              <p class="history">${i.cheapestStore}</p>
              </div>
              <button class="button" onclick="openModal('${simpleHash(i.name)}')">Lisätietoja</button>
            </div>
          </div>
          <dialog id="dialog-${simpleHash(i.name)}">
            <h3>${i.name}</h3>
            <p>${Object.keys(i.stores).sort((a, b) => i.stores[b].price - i.stores[a].price).map((storeName) => `${storeName}: ${i.stores[storeName].price} €`).join("<br>")}</p>
            <div id="chart-${simpleHash(i.name)}">Ladataan...</div>
            <button class="button" onclick="document.querySelector('#dialog-${simpleHash(i.name)}').close()">Sulje</button>
          </dialog>
          `).join("\n");  
})();

async function openModal(id) {
  document.querySelector(`#dialog-${id}`).showModal();
  window.plausible('Open product modal', { props: { product: document.querySelector('.product[data-product-id="' + id + '"] h3').textContent }});
  // Load information
  try {
  const res = await fetch(`https://jamsanlukio.fi/hintahistoria/output/products/${id}.json`);
  const data = await res.json();

  if (document.querySelector('#chart-js-' + id)) return;
  document.querySelector('#chart-' + id).innerHTML = `<canvas id="chart-js-${id}"></canvas>`;
  // chart.js
  const ctx = document.getElementById(`chart-js-${id}`).getContext('2d');
  
  const dates = data.data.map((i) => i.date);
  // I want one store to be one data set
  const stores = {};
  const prices = data.data.map((i) => {
    const obj = {};
    Object.keys(i.stores).forEach((store) => {
      obj[store] = i.stores[store];
      stores[store] = true;
    });
    return obj;
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: Object.keys(stores).map((store) => {
        return {
          label: store,
          data: prices.map((i) => i[store] ?? null),
          fill: false,
          borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
          tension: 0.1
        }
      })
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          },
          adapters: {
            date: {
              locale: 'fi'
            }
          }
        }
      }
    }
  });
}catch(e) {
  document.querySelector('#chart-' + id).innerHTML = 'Hintahistorian haku epäonnistui.';
}
}

(() => {
  document.querySelector('.search-box').addEventListener('click', () => {
    document.querySelector('.search-box input').focus();
  });

  // Function to perform the search
  function searchProducts() {
    const searchQuery = document.querySelector('.search-box input').value.toLowerCase();
    const products = document.querySelectorAll('.product');

    products.forEach(product => {
      const productName = product.querySelector('h3').textContent.toLowerCase();
      const matchType = getMatchType(productName, searchQuery);
      
      if (matchType) {
        product.style.display = 'flex';
        product.dataset.matchType = matchType;
      } else {
        product.style.display = 'none';
        product.dataset.matchType = '';
      }
    });

    sortProducts();
  }

  // Function to determine the match type
  function getMatchType(productName, query) {
    if (productName.startsWith(query)) return 'starts';
    if (productName.includes(query)) return 'includes';
    if (fuzzyMatch(productName, query)) return 'fuzzy';
    return null;
  }

  // Simple fuzzy matching function
  function fuzzyMatch(str, pattern) {
    let i = 0, j = 0;
    while (i < str.length && j < pattern.length) {
      if (str[i].toLowerCase() === pattern[j].toLowerCase()) j++;
      i++;
    }
    return j === pattern.length;
  }

  function sortProducts() {
    const productList = document.querySelector('.product-list');
    const products = Array.from(productList.querySelectorAll('.product'));
  
    products.sort((a, b) => {
      const order = ['starts', 'includes', 'fuzzy'];
      const aType = a.dataset.matchType;
      const bType = b.dataset.matchType;
  
      // First, sort by match type
      if (aType !== bType) {
        return order.indexOf(aType) - order.indexOf(bType);
      }
  
      // If match types are the same, sort alphabetically
      const aName = a.querySelector('h3').textContent.toLowerCase();
      const bName = b.querySelector('h3').textContent.toLowerCase();
      return aName.localeCompare(bName);
    });
  
    products.forEach(product => productList.appendChild(product));
  }

  // Add event listener to the search input
  document.querySelector('.search-box input').addEventListener('input', searchProducts);
})();