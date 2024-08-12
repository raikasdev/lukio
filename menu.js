// Hello! This JS script fetches the menu as JSON from Jamix, formats it and then displays it on the website.
// If you want to use this: it's licensed under MIT. (C) 2024 Roni Äikäs

// Config
const CUSTOMER_ID = 96665;
const KITCHEN_ID = 4;
const NORMAL_MENU = 349;
const VEGETARIAN_MENU = 350;

// The magic
async function getMenu() {
  const customerId = 96665;
  const kitchenId = 4; // These are from the Jamix API
  const startDate = getWeekDayGetter(1);
  const endDate = getWeekDayGetter(5); // From monday-friday of the current week

  const url = `https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/${customerId}/${kitchenId}?lang=fi&date=${formatDate(startDate)}&date2=${formatDate(endDate)}`;
  const res = await fetch(url);
  const [{ menuTypes }] = await res.json();
  const { menus } = menuTypes.find((menu) => menu.menuTypeName === "Koulut");
  const normalMenu = menus.find((menu) => menu.menuId === NORMAL_MENU);
  const vegetarianMenu = menus.find((menu) => menu.menuId === VEGETARIAN_MENU);

  document.querySelector('#menu-items').innerHTML = parseMenu(normalMenu).today;
  document.querySelector('#full-menu').innerHTML = parseMenu(normalMenu).weekMenu.map((i) => `<h4>${i.dateString}</h4>${i.menu}`).join("\n");
  document.querySelector('#vege-menu-items').innerHTML = parseMenu(vegetarianMenu).today;
  document.querySelector('#full-vege-menu').innerHTML = parseMenu(vegetarianMenu).weekMenu.map((i) => `<h4>${i.dateString}</h4>${i.menu}`).join("\n");
}

getMenu();


/**
 * Formats a JS date to YYYYMMDD string with padding
 * @param {Date} date The date to format
 * @returns {string} The formatted date
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`;
}

// Generate a function that gets the specified week day (0 = Sunday, 1 = Monday, ..., 6 = Saturday) from a date
function getWeekDayGetter(day) {
  const result = new Date();
  result.setDate(result.getDate() + day - result.getDay());
  return result;
}

// Parse a YYYYMMDD string to a Date object and then format it into a human-readable string (finnish) Maanantai, 1.1.2024
function formatDateToHuman(date) {
  date = `${date}`;
  // Split to YYYY, MM, DD without regex
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  const weekday = new Date(`${year}-${month}-${day}`).toLocaleDateString('fi-FI', { weekday: 'long' });
  // Get the first two letters of the weekday and capitalize
  return `${weekday.slice(0,1).toUpperCase()}${weekday.slice(1)} ${day}.${month}.${year}`;
}


function parseMenu(menu) {
  function parseDay({ mealoptions }) {
    const lunch = mealoptions.find((option) => option.name === 'Lounas');

    const items = lunch.menuItems.map((item) => `<p class="food">${item.name}${!item.diets ? '' : ` (${item.diets})`}</p>`);
    return items.join("\n")
  }
  const weekMenu = menu.days.map((i) => ({ date: i.date, dateString: formatDateToHuman(i.date), menu: parseDay(i) })).sort((a,b) => a.date - b.date);  
  
  return {
    today: weekMenu.find((i) => i.date == formatDate(new Date())?.menu ?? 'Ei ruokaa tänään',
    weekMenu
  }
}