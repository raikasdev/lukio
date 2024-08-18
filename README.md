# lukio

Jämsän lukion työkalupakki: linkkejä tärkeimpiin palveluihin, ruokalista ja muuta kivaa. Inspiraatio: [clasu.fi](https://clasu.fi).

## Kuvaus

Selainpuolen toiminnallisuudet on toteutettu pääasiassa JavaScriptillä:
 - menu.js -> ruokalista Jamixin rajapinnasta
 - day-counter.js -> laske päivät lomaan, tms.
 - fact.js -> hae satunnainen fakta
  - Tämä hyödyntää api-kansiosta löytyvää PHP-scriptiä joka hakee tekstitiedosta satunnaisen rivin ja muuttaa sen HTML-muotoon (tämä on tehty siksi, että tekstitiedostossa on myös linkkejä ja muotoiluja Markdownilla). Faktat on scrapettu Wikipediasta.
- paistopisteporssi.js -> LIDLin paistopisteen hintamuutokset
- weekly-events.js -> Viikkotiedotteen esittäminen

Pääasiassa ne ovat hyvin kevyitä ja pohjautuvat fetchiin.

### paistopiste

Hakee kerran päivässä LIDLin paistopisteen hinnat LIDLin sivuilta ja muodostaa niistä JSON sekä CSV tiedostot.

### hirsipuu

Hirsipuupeli. Hakee yksittäisen sanan rajapinnasta (api/hirsipuu.php)

### hintahistoria

Kerran päivässä hakee K-kauppojen ja S-marketin rajapinnasta tiettyjen tuotteiden (= energiajuomien) hintoja ja koostaa niistä JSON-tiedoston.

Koostaa "NOCCO-indeksin" eli mistä saa halvimmalla NOCCOa.
