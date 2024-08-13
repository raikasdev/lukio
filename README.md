# lukio

Jämsän lukion työkalupakki: linkkejä tärkeimpiin palveluihin, ruokalista ja muuta kivaa. Inspiraatio: [clasu.fi](https://clasu.fi).

## Kuvaus

Toiminnallisuudet on toteutettu pääasiassa JavaScriptillä:
 - menu.js -> ruokalista Jamixin rajapinnasta
 - day-counter.js -> laske päivät lomaan, tms.
 - fact.js -> hae satunnainen fakta
  - Tämä hyödyntää api-kansiosta löytyvää PHP-scriptiä joka hakee tekstitiedosta satunnaisen rivin ja muuttaa sen HTML-muotoon (tämä on tehty siksi, että tekstitiedostossa on myös linkkejä ja muotoiluja Markdownilla). Faktat on scrapettu Wikipediasta.