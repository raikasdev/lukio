import { throttledFetch } from "../slowdown";

export async function getProducts(allEans: string[], storeId: string) {
  let products: any[] = [];
  const chunkSize = 100;
  for (let i = 0; i < allEans.length; i += chunkSize) {
    const eans = allEans.slice(i, i + chunkSize);
    const apiURL = new URL(`https://api.mobile.k-ruoka.fi/graphql`);
    const res = await throttledFetch(apiURL.toString(), {
      headers: {
        'User-agent': 'K-Ruoka/6.36.5/4820 (Android 9; NE2210; OnePlus star2qltechn)',
        'x-client-platform': 'android',
        'x-client-version': '6.36.5',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        "operationName": "getProducts",
        "variables": {
          eans,
          storeId,
        },
        "query": "query getProducts($eans: [String!]!, $storeId: String!, $deliveryStart: String) {\n  getProducts(eans: $eans, storeId: $storeId, deliveryStart: $deliveryStart) {\n    ...ProductResponse\n    __typename\n  }\n}\n\nfragment ProductResponse on Product {\n  id\n  ean\n  brand\n  referenceId\n  storeId\n  localStoreId\n  imageUrl\n  productType\n  countryOfOrigin {\n    fi\n    sv\n    en\n    __typename\n  }\n  recipeInstructions {\n    fi\n    sv\n    en\n    __typename\n  }\n  storageAndUseInstructions {\n    fi\n    sv\n    en\n    __typename\n  }\n  contactInformation {\n    fi {\n      label\n      name\n      address\n      website\n      telephone\n      __typename\n    }\n    sv {\n      label\n      name\n      address\n      website\n      telephone\n      __typename\n    }\n    __typename\n  }\n  categories {\n    name {\n      finnish\n      swedish\n      english\n      __typename\n    }\n    path\n    __typename\n  }\n  description {\n    fi\n    sv\n    en\n    __typename\n  }\n  marketingDescription {\n    fi\n    sv\n    en\n    __typename\n  }\n  localizedName {\n    finnish\n    swedish\n    english\n    __typename\n  }\n  productAvailabilities {\n    storeId\n    web\n    store\n    __typename\n  }\n  nutritionalContent {\n    energyKj\n    energyKcal\n    carbohydrates {\n      amount\n      __typename\n    }\n    carbohydratesSugar {\n      amount\n      __typename\n    }\n    carbohydratesStarch {\n      amount\n      __typename\n    }\n    carbohydratesPolyol {\n      amount\n      __typename\n    }\n    fat {\n      amount\n      __typename\n    }\n    fatSaturated {\n      amount\n      __typename\n    }\n    fatMonoUnsaturated {\n      amount\n      __typename\n    }\n    fatPolyUnsaturated {\n      amount\n      __typename\n    }\n    protein {\n      amount\n      __typename\n    }\n    nutritionalFiber {\n      amount\n      __typename\n    }\n    salt {\n      amount\n      __typename\n    }\n    lactose {\n      amount\n      __typename\n    }\n    __typename\n  }\n  localizedNutritionalAttributes {\n    attribute\n    fi\n    sv\n    en\n    __typename\n  }\n  nutrientBasisQuantity {\n    fi\n    __typename\n  }\n  vitaminContent {\n    nutrients {\n      unit\n      amount\n      name {\n        fi\n        sv\n        en\n        __typename\n      }\n      __typename\n    }\n    basis {\n      fi\n      sv\n      en\n      __typename\n    }\n    __typename\n  }\n  productContents {\n    fi\n    sv\n    en\n    __typename\n  }\n  restriction {\n    type\n    i18n {\n      fi\n      sv\n      en\n      __typename\n    }\n    __typename\n  }\n  cautions {\n    storageInstructions {\n      code\n      instruction {\n        fi\n        sv\n        en\n        __typename\n      }\n      __typename\n    }\n    cautionaryInstructions {\n      code\n      instruction {\n        fi\n        sv\n        en\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  localizedAllergens {\n    contains {\n      fi\n      sv\n      en\n      __typename\n    }\n    freeFrom {\n      fi\n      sv\n      en\n      __typename\n    }\n    mayContain {\n      fi\n      sv\n      en\n      __typename\n    }\n    __typename\n  }\n  isAvailable\n  monthlyCheapestPrice\n  isDomestic\n  ...Pricing\n  alcoholAttributes {\n    mainRegion {\n      fi\n      sv\n      en\n      __typename\n    }\n    subRegion {\n      fi\n      sv\n      en\n      __typename\n    }\n    alcoholPercentage\n    sugarGramsPerLitre\n    acidsGramsPerLitre\n    sweetness {\n      fi\n      sv\n      en\n      __typename\n    }\n    tannins {\n      fi\n      sv\n      en\n      __typename\n    }\n    bodiness {\n      fi\n      sv\n      en\n      __typename\n    }\n    grapes {\n      fi\n      sv\n      en\n      __typename\n    }\n    __typename\n  }\n  measurements {\n    contentUnit\n    contentSize\n    averageWeight\n    netWeight\n    __typename\n  }\n  __typename\n}\n\nfragment Pricing on Product {\n  pricing {\n    normal {\n      price\n      unit\n      isApproximate\n      componentPrice\n      unitPrice {\n        value\n        unit\n        __typename\n      }\n      __typename\n    }\n    discount {\n      price\n      unit\n      isApproximate\n      unitPrice {\n        value\n        unit\n        __typename\n      }\n      startDate\n      endDate\n      discountType\n      discountPercentage\n      tosRestrictionText {\n        finnish\n        swedish\n        english\n        __typename\n      }\n      maxItems\n      discountAvailability {\n        store\n        web\n        daily {\n          monday\n          tuesday\n          wednesday\n          thursday\n          friday\n          saturday\n          sunday\n          startTime\n          endTime\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    batch {\n      price\n      unit\n      isApproximate\n      unitPrice {\n        value\n        unit\n        __typename\n      }\n      startDate\n      endDate\n      discountType\n      discountPercentage\n      amount\n      maxItems\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n"
      })
    });

    const data = await res.json();
    products = products.concat(data.data.getProducts);
  }
  
  return products.map((i: any) => {
    const discounts = [];
    if (i.isAvailable === false) return null;
    if (i.pricing.discount && i.pricing.discount.discountType === 'PLUSSA') {
      discounts.push({
        type: 'kplussa',
        price: i.pricing.discount.price,
      });
    }
    if (i.pricing.batch && i.pricing.batch.discountType === 'PLUSSA') {
      discounts.push({
        type: 'kplussa_batch',
        batch: i.pricing.batch.amount,
        price: i.pricing.batch.price,
      });
    }

    return {
      ean: i.ean,
      image: i.imageUrl,
      price: i.pricing.normal.price,
      discounts,
    }
  }).filter((i: any) => i !== null) as { ean: string; image: string; price: number; discounts: { type: string; price: number; batch?: number; }[] }[];
}
