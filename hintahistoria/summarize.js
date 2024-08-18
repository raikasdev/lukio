
const outputDir = process.env.OUTPUT_DIR ?? './output';

async function loadData(date, data = {}) {
  const currentDate = date.toISOString().split('T')[0];
  const file = Bun.file(`${outputDir}/${currentDate}.json`);

  if (!(await file.exists())) {
    console.log(`Data for ${currentDate} not found.`);
    return data;
  }

  console.log('processing', currentDate)
  const jsonData = await file.json();
  Object.keys(jsonData.products).forEach((i) => {
    // stores: { "S-Market Jämsä": { price: 1.99 }, "K-Market Jämsä": {price: 2.49 } }
    // Get the cheapest price and store it's in
    let stores = Object.keys(jsonData.products[i].stores);
    stores.forEach((store) => {
      const { discounts } = jsonData.products[i].stores[store];
      discounts.forEach((discount) => {
        jsonData.products[i].stores[`${store} (${discount.type === 'kplussa' ? 'K-Plussa' : discount.type === 'kplussa_batch' ? `K-Plussa (${discount.batch}kpl)` : discount.type})`] = {
          price: discount.price,
        };
      });
    });
    stores = Object.keys(jsonData.products[i].stores);
    const price = Math.min(...stores.map((store) => jsonData.products[i].stores[store].price));
    const store = stores.find((store) => jsonData.products[i].stores[store].price === price);

    const dayObject = {
      stores: Object.fromEntries(Object.keys(jsonData.products[i].stores).map((name) => [name, jsonData.products[i].stores[name].price])),
      price,
      cheapestStore: store,
    };
    const productData = data[i] ?? {};
    productData[currentDate] = dayObject;
    data[i] = productData;
    // alphabetically sort
  });

  return await loadData(new Date(date.getTime() - 24 * 60 * 60 * 1000), data);
}

const simpleHash = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  // Convert to 32bit unsigned integer in base 36 and pad with "0" to ensure length is 7.
  return (hash >>> 0).toString(36).padStart(7, '0');
};

const data = await loadData(new Date());

Object.keys(data).forEach((product) => {
  const productData = data[product];
  const dates = Object.keys(productData).sort();
  const productHash = simpleHash(product);
  const productFile = Bun.file(`${outputDir}/products/${productHash}.json`);
  const productSummary = {
    name: product,
    data: dates.map((date) => ({ date, ...productData[date] })),
  };
  Bun.write(productFile, JSON.stringify(productSummary, null, 2));
});