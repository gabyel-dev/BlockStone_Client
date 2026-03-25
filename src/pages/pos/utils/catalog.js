const POS_CATALOG_CACHE_KEY = "pos-services-catalog-v1";

// Converts backend services object into a sectioned catalog list used by POS.
export const mapServicesObjectToCatalog = (servicesObject = {}) =>
  Object.entries(servicesObject).reduce(
    (catalog, [categoryName, serviceMap]) => {
      const items = Object.entries(serviceMap || {}).reduce(
        (allItems, [serviceName, options]) => {
          const mapped = (options || []).map((option) => {
            const name = String(option.option_name).trim() || serviceName;

            return {
              id: option.service_id,
              name,
              price: Number(option.price ?? 0),
              unit: option.unit,
              customPrice: 0,
              priceOptionId: option.price_option_id,
              serviceId: option.service_id,
            };
          });

          return allItems.concat(mapped);
        },
        [],
      );

      catalog.push({ section: categoryName, items });
      return catalog;
    },
    [],
  );

export const buildItemKey = (item) =>
  `${item.id}-${item.priceOptionId ?? item.name}`;

// Reads service catalog from localStorage and returns empty list when unavailable.
export const readCatalogCache = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawCache = window.localStorage.getItem(POS_CATALOG_CACHE_KEY);
    const parsedCache = JSON.parse(rawCache || "{}");

    return Array.isArray(parsedCache?.catalog) ? parsedCache.catalog : [];
  } catch {
    return [];
  }
};

// Saves current catalog snapshot for next page load reuse.
export const writeCatalogCache = (catalog) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    POS_CATALOG_CACHE_KEY,
    JSON.stringify({
      catalog,
      cachedAt: Date.now(),
    }),
  );
};
