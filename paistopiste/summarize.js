// Käsittelee päivädataa ja sen perusteella luo tiedon tuotteen hinnan muutoksista viimeisen 6kk aikana.

const outputDir = process.env.OUTPUT_DIR ?? './output';

async function loadData(date, data = {}) {
  const currentDate = date.toISOString().split('T')[0];
  const file = Bun.file(`${outputDir}/${currentDate}.json`);

  if (!(await file.exists())) {
    console.log(`Data for ${currentDate} not found.`);
    return data;
  }

  const json = await file.json();
  json.forEach(({ fullTitle, price }) => {
    const product = data[fullTitle] || {};
    product[currentDate] = price;
    data[fullTitle] = product;
  });

  return await loadData(new Date(date.getTime() - 24 * 60 * 60 * 1000), data);
}

const prices = await loadData(new Date());

function calculatePriceChanges(prices) {
  const results = {};
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  function formatTimePeriod(startDate, endDate) {
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth();
    const yearsDiff = Math.floor(monthsDiff / 12);

    let time = "";
    if (yearsDiff > 0) {
      time += `${yearsDiff} vuoden ja `;
    }

    time += `${Math.max(1, monthsDiff)} kuukauden ajan`;
    return time;
  }

  for (const [product, priceHistory] of Object.entries(prices)) {
    const dates = Object.keys(priceHistory).sort((a, b) => new Date(b) - new Date(a));

    if (dates.length < 2) {
      results[product] = "Ei hintamuutoksia datan keräämisen alun jälkeen (11.8.2024).";
      continue;
    }

    const earliestDate = new Date(dates[dates.length - 1]);
    const latestPrice = priceHistory[dates[0]];

    let comparisonPrice = priceHistory[dates[dates.length - 1]];
    let comparisonDate = dates[dates.length - 1];
    let newData = true;

    if (new Date(comparisonDate) < sixMonthsAgo) {
      const suitableDates = dates.filter((i) => new Date(i) >= sixMonthsAgo);
      comparisonDate = suitableDates[suitableDates.length - 1];
      comparisonPrice = priceHistory[comparisonDate];
      newData = false;
    }

    if (latestPrice === comparisonPrice) {
      const timePeriod = formatTimePeriod(earliestDate, today);
      // Jos koko datasetin aikana hinta ei ole muuttunut kertaakaan, se on todnäk pysynyt samana jo pidempäänkin :D
      results[product] = {
        text: `Hinta on pysynyt samana ${newData ? 'yli ' : ''}${timePeriod}.`,
        direction: 'neutral'
      }
    } else {
      const changePercentage = ((latestPrice - comparisonPrice) / comparisonPrice) * 100;
      const formattedPercentage = Math.abs(changePercentage).toFixed(1);
      const direction = changePercentage > 0 ? "noussut" : "laskenut";

      results[product] = {
        text: `Hinta on ${direction} ${formattedPercentage}% viimeisen 6 kuukauden aikana. ${comparisonPrice.toLocaleString('fi', { style: 'currency', currency: 'EUR' })} -> ${latestPrice.toLocaleString('fi', { style: 'currency', currency: 'EUR' })} (${comparisonDate})`,
        direction: changePercentage > 0 ? 'up' : 'down'
      };
    }
  }

  return results;
}

const priceChanges = calculatePriceChanges(prices);

Bun.write(`${outputDir}/price-changes.json`, JSON.stringify(
  {
    lastUpdated: new Date().toISOString().split("T")[0],
    changes: priceChanges
  }, null, 2)
);

// Print the results
for (const [product, result] of Object.entries(priceChanges)) {
  console.log(`${product}: ${result.text}`);
}