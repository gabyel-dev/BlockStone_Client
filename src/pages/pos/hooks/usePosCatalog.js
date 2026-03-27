import { useEffect, useState } from "react";
import { getPrintServices } from "../../../api/print";
import {
  mapServicesObjectToCatalog,
  readCatalogCache,
  writeCatalogCache,
} from "../utils/catalog";

export const usePosCatalog = () => {
  const [catalog, setCatalog] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    const cachedCatalog = readCatalogCache();
    if (cachedCatalog.length > 0) {
      setCatalog(cachedCatalog);
      setIsCatalogLoading(false);
      return;
    }

    let isMounted = true;

    const fetchServices = async () => {
      try {
        setIsCatalogLoading(true);
        setCatalogError("");

        const response = await getPrintServices();
        const servicesObject = response?.data?.data?.services;
        const mappedCatalog = mapServicesObjectToCatalog(servicesObject);

        if (isMounted) {
          setCatalog(mappedCatalog);
          writeCatalogCache(mappedCatalog);
        }
      } catch {
        if (isMounted) {
          setCatalogError(
            "Unable to load services. Please refresh and try again.",
          );
          setCatalog([]);
        }
      } finally {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    catalog,
    isCatalogLoading,
    catalogError,
  };
};
