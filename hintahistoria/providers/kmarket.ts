export async function getProducts(queryString: string, storeId: string) {
    const apiURL = new URL(`https://www.k-ruoka.fi/kr-api/v2/product-search/${encodeURIComponent(queryString)}`);
    const props = new URLSearchParams();
    props.set('storeId', storeId);
    props.set('offset', '0');
    props.set('limit', '100');
    apiURL.search = props.toString();

    const proxyURL = new URL('https://proxy.scrapeops.io/v1');
    const proxyProps = new URLSearchParams();
    proxyProps.set('api_key', Bun.env.SCRAPE_API_KEY ?? 'null');
    proxyProps.set('url', 'https://www.k-ruoka.fi/kauppa/tuotehaku/juomat/energia--ja-urheilujuomat/energiajuomat?tuote=es-original-energiajuoma-05l-tlk-8717775819691');
    proxyProps.set('render_js', 'true'); 
    proxyProps.set('residential', 'true'); 
    proxyProps.set('country', 'fi');
    proxyProps.set('keep_headers', "true");
    proxyURL.search = proxyProps.toString();

    const res = await fetch(proxyURL.toString(), {});
    if (res.status == 403 && res.headers.get('cf-mitigated') === 'challenge') {
        // Cloudflare :middle_finger:
        Bun.write('./cloudflare.html', await res.text())
        throw new Error('Cloudflare fail');
    }

    const data = await res.text();
    Bun.write('./data-k-raw.html', data);
    return;
    const products = data.data.store.products;

    Bun.write('./data-k.json', JSON.stringify(products, null, 2));
}
  
await getProducts('NOCCO', 'N157');
