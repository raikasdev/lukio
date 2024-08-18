import { throttledFetch } from "../slowdown";

export async function getProducts(eans: string[], storeId: string) {
  const products = await Promise.all(eans.map(async (ean) => {
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
        queryString: ean,
        searchProvider: "loop54",
        storeId,
        useRandomId: false,
      }),
    );
    apiURL.search = props.toString();

    const res = await throttledFetch(apiURL.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'x-client-name': 'skaupat-web',
        'x-client-version': 'production-9e13dda19bd01c5864e17d411e8f92f80d8e5c21'
      }
    });
    const { data } = await res.json();
    if (data.store.products.total === 0) {
      return null;
    }
    const { ean: productEan, price, productDetails } = data.store.products.items[0];
    return {
      ean: productEan,
      image: productDetails.productImages.mainImage.urlTemplate
        .replace(productDetails.productImages.modifiersString, 'w384_h384_q75')
        .replace(productDetails.productImages.extensionString, 'jpg'),
      price,
      discounts: [],
    }
  }));

  return products.filter((i) => i !== null);
}