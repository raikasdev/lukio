// Load data from config
import { products, stores } from './config.json';

// Load providers
import { getProducts as getKMarketProducts } from './providers/kmarket';
import { getProducts as getSMarketProducts } from './providers/smarket';

type Product = {
  ean: string;
  price: number;
  image: string;
  discounts: {
    type: string;
    price: number;
    batch?: number;
  }[];
}
const storeProviders: Record<string, (eans: string[], storeId: string) => Promise<Product[]>> = {
  kmarket: getKMarketProducts,
  smarket: getSMarketProducts,
} as const;

const results: Record<string, Record<string, Omit<Product, "ean">>> = {};

const startTime = Date.now();

// Get all products from all stores
await Promise.all((Object.keys(stores) as (keyof typeof stores)[]).map(async (storeName: keyof typeof stores) => {
  const localStores = stores[storeName];
  await Promise.all((Object.keys(localStores) as (keyof typeof localStores)[]).map(async (localStoreName) => {
    const storeId = localStores[localStoreName];
    const productInfo = await storeProviders[storeName](Object.values(products).map((i) => `${i}`), storeId);
    productInfo.forEach((product) => {
      results[product.ean] = results[product.ean] || {};
      const { price, discounts, image } = product;
      results[product.ean][localStoreName] = { price, discounts, image };
    });
  }));
}));

// Get product name from products and finalize JSON

const finalResults: Record<string, {
  ean: string;
  image: string;
  stores: Record<string, Omit<Product, "ean">>;
}> = {};

Object.keys(results).forEach((ean) => {
  const productName = (Object.keys(products) as (keyof typeof products)[]).find((key) => products[key] === ean) ?? 'Tuntematon tuote';
  finalResults[productName] = {
    ean,
    image: results[ean][Object.keys(results[ean]).find((i) => i.startsWith('K-')) ?? Object.keys(results[ean])[0]].image, // Kesko tends to have bit better product images
    stores: results[ean],
  };
});

const finalOutput = {
  timestamp: new Date().toISOString(),
  products: finalResults,
}

const OUTPUT_DIR = Bun.env.OUTPUT_DIR ?? './output'
Bun.write(`${OUTPUT_DIR}/prices.json`, JSON.stringify(finalOutput));
Bun.write(`${OUTPUT_DIR}/${new Date().toISOString().split("T")[0]}.json`, JSON.stringify(finalOutput));

const timeTook = Date.now() - startTime;
console.log(`Done! Took ${timeTook}ms`);