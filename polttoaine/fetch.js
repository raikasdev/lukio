// Fetches prices

// GET API KEY
async function getApiKey() {
  const res = await fetch('https://api.tankille.fi/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({
      token: Bun.env.REFRESH_TOKEN
    }),
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'FuelFellow/3.7.1 (SM-G988N; Android 7.1.2)'
    }
  });
  const { accessToken } = await res.json();

  return accessToken;
}

const apiKey = await getApiKey();

// GET PRICES
const res = await fetch(`https://api.tankille.fi/stations?location=${encodeURIComponent('25.182,61.864')}&distance=15000`, {
  headers: {
    'x-access-token': apiKey,
    'User-Agent': 'FuelFellow/3.7.1 (SM-G988N; Android 7.1.2)'
  }
});
const stations = (await res.json()).map(({ location, address, name, price }) => {
  const prices = Object.fromEntries(price.map(({ tag, price }) => [tag, price]));

  return {
    name,
    address,
    location: {
      lat: location.coordinates[0],
      lon: location.coordinates[1]
    },
    prices
  };
});

// Now get the cheapest for each fuel type (95, 98, dsl)
function findCheapestStations(stations) {
  const fuelTypes = ['95', '98', 'dsl'];
  const results = {};

  fuelTypes.forEach(fuelType => {
      // Filter out stations with zero price for this fuel type
      const validStations = stations.filter(station => station.prices[fuelType] > 0);
      
      if (validStations.length > 0) {
          // Sort stations by price for this fuel type
          const sortedStations = validStations.sort((a, b) => a.prices[fuelType] - b.prices[fuelType]);
          
          // Store the result
          results[fuelType] = sortedStations.map(station => ({
              name: station.name,
              address: station.address,
              location: station.location,
              price: station.prices[fuelType]
          }));
      } else {
          results[fuelType] = [];
      }
  });

  return results;
}

await Bun.write('stations.json', JSON.stringify(stations, null, 2));
await Bun.write('cheapest.json', JSON.stringify(findCheapestStations(stations), null, 2));

console.log('Done')