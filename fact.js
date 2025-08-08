fetch('https://jamsanlukio.fi/api/fact.php').then((res) => res.text()).then((html) => {
  document.querySelector('#random-fact').innerHTML = html;
}).catch((e) => {
  document.querySelector('#random-fact').innerHTML = '<p>Faktan haku epäonnistui. Perhana.</p>';
})
