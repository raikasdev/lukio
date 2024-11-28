function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getEvents() {
  try {
    let cacheDate;
    if (localStorage.getItem('events-cache')) {
      const { date, data: cacheData } = JSON.parse(localStorage.getItem('events-cache'));
      cacheDate = date;
      processData(cacheData, date);
    }
    const res = await fetch('https://lukio.raikas.dev/tiedotteet/events.json');
    const data = await res.json();
    const lastUpdated = new Date(res.headers.get('Date')).toLocaleString('fi');
    if (cacheDate && lastUpdated === cacheDate) {
      return;
    }

    processData(data, lastUpdated);
    localStorage.setItem('events-cache', JSON.stringify({ date: lastUpdated, data }));
  } catch (e) {
    document.querySelector('#week-bulletin-events').innerHTML = 'Viikkotiedotteen haku epäonnistui :(';
    console.error(e);
  }
}

function processData(data, lastUpdated) {
  const events = Object
      .keys(data.events)
      .map((date) => ({
        date: capitalize(
          new Date(date).toLocaleDateString(
            'fi',
            { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric'}
          )
        ),
        events: data.events[date].map((i) => i.replaceAll('\n', '<br>')).join("<br/>")
      }))
      .sort((a, b) => a.date - b.date)
      .filter((i) => i.events !== "");

    const upcoming = Object
      .keys(data.upcoming)
      .map((date) => ({
        date: capitalize(
          new Date(date).toLocaleDateString(
            'fi',
            { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric'}
          )
        ),
        events: data.upcoming[date].join("<br/>")
      }))
      .sort((a, b) => a.date - b.date)
      .filter((i) => i.events !== "");

    const weekEvents = events.map((event) => `<h4>${event.date}</h4><p>${event.events}</p>`).join("\n");
    const extra = data.extra.length > 0 ? `<h4>Muuta ajankohtaista</h4><p>${data.extra.join("<br>")}</p>` : "";
    const upcomingEvents = `<h4>Tulevaa</h4><p>${upcoming.map((event) => `<strong>${event.date}</strong>: ${event.events}`).join("<br>")}`;
    document.querySelector('#week-bulletin-events').innerHTML = weekEvents + extra + upcomingEvents;
    document.querySelector('#last-updated').innerHTML = lastUpdated;
}

getEvents();
