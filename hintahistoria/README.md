# hintahistoria

Seuraa paikallisten kauppojen tiettyjen tuotteiden hintoja.

## Tuetut kaupat

- S-market
- K-market, K-citymarket, jne.

## Asetukset

Asetukset määritellään `config.json`-tiedostossa. Esimerkki:

```json
{
  "products": {
    "Selkokielinen tuotenimi": "EAN-kodi",
    "Megaforce 0,5l": "8711900010311",
  },
  "stores": {
    "kmarket": {
      "K-Citymarket Jämsä": "N157",
      "K-Market Jämsä": "K426"
    },
    "smarket": {
      "S-Market Jämsä": "660919473"
    }
  }
}
```

Kauppojen koodit ovat kauppojen rajapintojen käyttämiä tunnisteita. Niiden löytämiseksi on käytettävä kehittäjätyökaluja.