// This might be bad as it's written by Claude :)

const config = {
  "totalWorkDays": 188,
  "autumnSemester": {
    "start": "2025-08-06",
    "end": "2025-12-19",
    "breaks": [
      {
        "name": "Syysloma (vko 42)",
        "start": "2025-10-13",
        "end": "2025-10-19"
      },
      {
        "name": "Itsenäisyyspäivä",
        "date": "2025-12-06"
      }
    ]
  },
  "christmasBreak": {
    "start": "2025-12-20",
    "end": "2026-01-06"
  },
  "springSemester": {
    "start": "2026-01-07",
    "end": "2026-05-31",
    "breaks": [
      {
        "name": "Talviloma (vko 9)",
        "start": "2026-02-23",
        "end": "2026-03-01"
      },
      {
        "name": "Pääsiäinen",
        "start": "2026-04-03",
        "end": "2026-04-06"
      },
      {
        "name": "Vappuvapaa",
        "date": "2026-05-01"
      },
      {
        "name": "Helatorstai",
        "date": "2026-05-14"
      }
    ]
  },
  "abiturientsFinalDay": "2025-02-03",
  "periods": [
    {
      "number": 1,
      "start": "2025-08-06",
      "end": "2025-09-26",
      "days": 38,
      "finalWeek": {
        "start": "2025-09-19",
        "end": "2025-09-26"
      }
    },
    {
      "number": 2,
      "start": "2025-09-29",
      "end": "2025-11-21",
      "days": 35,
      "finalWeek": {
        "start": "2025-11-14",
        "end": "2025-11-21"
      }
    },
    {
      "number": 3,
      "start": "2025-11-24",
      "end": "2026-01-30",
      "days": 38,
      "finalWeek": {
        "start": "2026-01-23",
        "end": "2026-01-30"
      }
    },
    {
      "number": 4,
      "start": "2026-02-02",
      "end": "2026-03-31",
      "days": 37,
      "finalWeek": {
        "start": "2026-03-24",
        "end": "2026-03-31"
      }
    },
    {
      "number": 5,
      "start": "2026-04-01",
      "end": "2026-05-31",
      "days": 40,
      "finalWeek": {
        "start": "2026-05-21",
        "end": "2026-05-28"
      }
    }
  ]
}

function getDaysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((date2 - date1) / oneDay));
}

function getNextBreak(currentDate) {
  const breaks = [
    ...config.autumnSemester.breaks,
    {name: "Joululoma", start: config.christmasBreak.start, end: config.christmasBreak.end},
    ...config.springSemester.breaks
  ];
  
  let ongoing = false;
  for (let breakPeriod of breaks) {
    const breakStart = new Date(breakPeriod.start || breakPeriod.date);
    const breakEnd = new Date(breakPeriod.end || breakPeriod.date);
    breakEnd.setHours(23, 59, 59);
    if (breakStart > currentDate) {
      return { ...breakPeriod, ongoing };
    } else if (breakEnd > currentDate) {
      ongoing = true;
    }
  }
  return null;
}

function getNextPeriodStart(currentDate) {
  for (let period of config.periods) {
    const periodStart = new Date(period.start);
    if (periodStart > currentDate) {
      return periodStart;
    }
  }
  return null;
}

function getCurrentPeriod(currentDate) {
  for (let i = config.periods.length - 1; i >= 0; i--) {
    const periodStart = new Date(config.periods[i].start);
    if (currentDate >= periodStart) {
      return config.periods[i];
    }
  }
  return null;
}

function generateOutput(currentDate) {
  const nextBreak = getNextBreak(currentDate);
  const currentPeriod = getCurrentPeriod(currentDate);
  const nextPeriodStart = getNextPeriodStart(currentDate);
  const abiturientsFinalDay = new Date(config.abiturientsFinalDay);

  let output = "<p>";

  if (nextBreak) {
    if (nextBreak.ongoing) {
      output += "Mitä ihmettä sinä täällä lomalla teet? ";
    }
      const breakStart = new Date(nextBreak.start || nextBreak.date);
      const daysUntilBreak = getDaysBetween(currentDate, breakStart);
      const schoolDaysUntilBreak = Math.round(daysUntilBreak * 5 / 7); // Approximation
      output += `Seuraava loma on ${nextBreak.name}, johon on ${daysUntilBreak} päivä${daysUntilBreak !== 1 ? 'ä' : ''} (~${schoolDaysUntilBreak} koulupäivä${schoolDaysUntilBreak !== 1 ? 'ä' : ''}). `;
  } else {
    output += "Se olis kesäloma. Tai sitten en ole päivittänyt lomia sisään. ";
  }

  output += "</p><p>"

  if (currentPeriod && currentPeriod !== config.periods[config.periods.length - 1]) {
    const daysUntilFinalWeek = getDaysBetween(currentDate, new Date(currentPeriod.finalWeek.start));
    if (daysUntilFinalWeek > 0) {
      output += `Päättöviikon alkuun ${daysUntilFinalWeek} päivä${daysUntilFinalWeek !== 1 ? 'ä' : ''}`;
    }

    if (nextPeriodStart) {
      const daysUntilNextPeriod = getDaysBetween(currentDate, nextPeriodStart);
      if (daysUntilFinalWeek > 0) {
        output += ` ja seuraavan periodin alkuun ${daysUntilNextPeriod} päivä${daysUntilNextPeriod !== 1 ? 'ä' : ''}. `;
      } else {
        output += `Seuraavan periodin alkuun ${daysUntilNextPeriod} päivä${daysUntilNextPeriod !== 1 ? 'ä' : ''}. `;
      }
    } else if (daysUntilFinalWeek > 0) {
      output += '. ';
    }
  }

  if (currentDate < abiturientsFinalDay) {
    const daysUntilAbiturientsFinalDay = getDaysBetween(currentDate, abiturientsFinalDay);
    output += `Abit lähtevät talosta ${daysUntilAbiturientsFinalDay} päivän kuluttua.`;
  }

  output += "</p>";

  return output.trim();
}

// Usage
const today = new Date();
document.getElementById('day-counter').innerHTML = generateOutput(today);