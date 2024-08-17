export async function getProducts(queryString: string) {
    const apiURL = new URL("https://cfapi.voikukka.fi/graphql");
    const props = new URLSearchParams();
    props.set("operationName", "RemoteFilteredProducts");
    props.set(
      "extensions",
      '{"persistedQuery":{"version":1,"sha256Hash":"1d68935b2d9096db1daa0461489a1a6d22b8cd92bffc0a109f5d3eaa4e2bf3b5"}}',
    );
    props.set(
      "variables",
      JSON.stringify({
        includeAvailabilities: false,
        facets: [
          { key: "brandName", order: "asc" },
          { key: "category" },
          { key: "labels" },
        ],
        generatedSessionId: "d811b971-aeb2-49bf-b388-e5fe257436b0",
        includeAgeLimitedByAlcohol: false,
        limit: 100,
        loop54DirectSearch: true,
        queryString,
        searchProvider: "loop54",
        storeId: "660919473",
        useRandomId: false,
      }),
    );
    apiURL.search = props.toString();

    const res = await fetch(apiURL.toString(), {
        headers: {
            'Content-Type': 'application/json',
            'x-client-name': 'skaupat-web',
            'x-client-version': 'production-9e13dda19bd01c5864e17d411e8f92f80d8e5c21'
        }
    });
    const { data } = await res.json();
    const products = data.store.products;

    console.log(products);
    Bun.write('./data.json', JSON.stringify(products, null, 2));
}
  

await getProducts('NOCCO');