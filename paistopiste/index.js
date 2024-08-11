import { parse as parseHTML } from 'node-html-parser';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse, stringify } from 'csv/sync';

const res = await fetch('https://www.lidl.fi/c/paistopiste/a10021140');
const html = await res.text();

const root = parseHTML(html);

const products = root.querySelectorAll('.ACampaignGrid__item[data-grid-data]').map((el) => {
  const raw = JSON.parse(el.getAttribute('data-grid-data'))[0];
  const { fullTitle, image, price: { price } } = raw;
  return {
    fullTitle,
    image,
    price,
    raw,
  }
});
const currentDate = new Date().toISOString().split('T')[0]; 

const raw = JSON.stringify(products.map((p) => p.raw), null, 2);
const data = JSON.stringify(products.map(({ raw, ...data }) => data), null, 2);
await Bun.write(`output/${currentDate}_raw.json`, raw);
await Bun.write(`output/${currentDate}.json`, data);

const filename = 'output/paistopiste.csv';

function updateCSV() {
  let csvData = [];
  let headers = ['Pvm'];

  // Read existing CSV file if it exists
  if (existsSync(filename)) {
    const fileContent = readFileSync(filename, 'utf-8');
    csvData = parse(fileContent, { columns: true, skip_empty_lines: true });
    headers = Object.keys(csvData[0]);
  }

  // Update headers with current product titles
  products.forEach(product => {
    if (!headers.includes(product.fullTitle)) {
      headers.push(product.fullTitle);
    }
  });

  // Create new row with current date and prices
  const newRow = { Pvm: currentDate };
  products.forEach(product => {
    newRow[product.fullTitle] = product.price;
  });

  // Add the new row to csvData
  csvData.push(newRow);

  // Write updated data back to CSV file
  const csvString = stringify(csvData, { header: true, columns: headers });
  writeFileSync(filename, csvString);

  console.log(`CSV file '${filename}' has been updated with the latest prices.`);
}

await updateCSV();
