function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getEvents() {
  try {
    const res = await fetch('https://lukio.raikas.dev/tiedotteet/events.json');
    const data = await res.json();
    const lastUpdated = new Date(res.headers.get('last-modified')).toLocaleDateString('fi');

    // { events: { 'YYYY-MM-DD': [ 'Event name', 'Event 2 name' ] }, upcoming: { 'YYYY-MM-DD': ['Event name', 'Event 2 name']}, extra: ['Event name'] }

    // Sort by date, oldest first
    const events = Object
      .keys(data.events)
      .map((date) => ({
        date: capitalize(
          new Date(date).toLocaleDateString(
            'fi',
            { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric'}
          )
        ),
        events: data.events[date].join("<br/>")
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
    console.log(events);
  } catch (e) {
    console.error(e);
  }
}

getEvents();