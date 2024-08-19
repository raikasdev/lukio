import OpenAI from 'openai';
import { parse } from 'node-html-parser';

type Calendar = { events: Record<string, string[]>, extra: string[] };

async function parseEvents(weeklyBulletin: string): Promise<Calendar> {
  const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
  });
  
  const SYSTEM_MESSAGE = `You will be supplied with a weekly bulletin message containing events happening in the future.
  Create a JSON based calendar where the key shall be the date in YYYY-MM-DD format and the value an array of strings being events.
  You may edit the event names to for example add a missing a capital letter.
  This calendar should be in the "events" object of the JSON.
  Only events happening during the current/next week should be in this array.
  Upcoming events should be in an object of the same format but named "upcoming".
  Generic event information like a psychologist being available on x days shouldnt be marked as an event, but added to an "extra"-key to an array where one string is one extra thing.
  You need to work in Finnish.
  If an even lasts for more than a day (for example exams on a specific week), it shouldn't be noted. Do not include "ylioppilaskirjoitukset" in the upcoming section.`
  
  
  const response = await client.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_MESSAGE },
      { role: 'user', content: weeklyBulletin },
    ],
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
  });
  
  return JSON.parse(response.choices[0]?.message?.content ?? 'null');
}

async function getWeeklyBulletin(): Promise<string> {
  const res = await fetch('https://jamsa.inschool.fi/j%C3%A4ms%C3%A4n.lukio');
  const html = await res.text();
  const root = parse(html);

  const news = root.querySelectorAll('.left .panel-body .well.margin-bottom').map((i) => {
    const dateFi = i.querySelector('h3')?.childNodes[1].textContent!;
    // Turn dateFi in dd.mm.YYYY to a JS date object
    const [day, month, year] = dateFi.split('.');
    const date = new Date(`${year}-${month}-${day}`);

    return {
      name: i.querySelector('h3')?.childNodes[0].textContent.trim(),
      date: date,
      url: decodeURIComponent(i.querySelector('a')?.getAttribute('href') ?? ''),
    }
  }).filter((i) => i.name?.toLowerCase().includes("viikkotiedote") || i.name?.toLowerCase().includes("tiedote viikolle"));

  // Now get the latest weekly bulletin by date
  const latest = news.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  if (!latest) {
    console.error('Shit hit the fan, no latest');
    process.exit(1); // Fuck
  }

  async function fetchLatest() {
    const res = await fetch(new URL(latest.url, 'https://jamsa.inschool.fi'));
    const html = await res.text();
    const root = parse(html);

    const text = root.querySelector('#news-content')?.textContent;
    if (!text) {
      console.error('Well shit no content');
      process.exit(1);
    }

    return text;
  }
  
  return await fetchLatest();
}

const weeklyBulletin = await getWeeklyBulletin();
const events = await parseEvents(weeklyBulletin);

await Bun.write('./events.json', JSON.stringify(events, null, 2));

console.log('Succesfully parsed events!');