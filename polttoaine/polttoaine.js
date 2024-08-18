async function fetchFuelPrices() {
  const res = await fetch('./cheapest.json', {
    headers: {
      pragma: 'no-cache',
      "cache-control": 'no-cache'
    }
  });
  const prices = await res.json();

  ['95', '98', 'dsl'].forEach(fuelType => {
    const fuelPrices = prices[fuelType];
    const cheapest = fuelPrices[0];

    document.querySelector('#cheapest-' + fuelType).textContent = cheapest.price;
    const header =`<tr>
            <th>Nimi</th>
            <th>Hinta</th>
          </tr>`;
    document.querySelector('#cheapest-' + fuelType + "-stations").innerHTML = header + fuelPrices.map((station, index) => {
      const price = station.price.toLocaleString('fi', { style: 'currency', currency: 'EUR', minimumFractionDigits: 3 });
      return `<tr><td>${index === 0 ? `<strong>${station.name}</strong>` : station.name}</td><td>${index === 0 ? `<strong>${price}</strong>` : price}</td></tr>`;
    }).join('');
  });
}

fetchFuelPrices();