import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_META = {
  title: "BlockStone Printing | Professional Printing Services",
  description:
    "BlockStone Printing provides professional print services with a modern operations platform for order flow, dashboard reporting, and inventory management.",
  robots: "index, follow",
  canonicalPath: "/",
};

const ROUTE_META = {
  "/": {
    title: "BlockStone Printing | Professional Printing Services",
    description:
      "Professional printing services with a modern workflow platform for faster order intake, service management, and inventory-aware operations.",
    robots: "index, follow",
    canonicalPath: "/",
  },
  "/login": {
    title: "Sign In | BlockStone Printing",
    description:
      "Sign in to access the BlockStone Printing operations dashboard.",
    robots: "noindex, nofollow",
    canonicalPath: "/login",
  },
  "/dashboard": {
    title: "Dashboard | BlockStone Printing",
    description: "Operational dashboard for BlockStone Printing users.",
    robots: "noindex, nofollow",
    canonicalPath: "/dashboard",
  },
  "/pos": {
    title: "POS | BlockStone Printing",
    description: "Point-of-sale workspace for BlockStone Printing users.",
    robots: "noindex, nofollow",
    canonicalPath: "/pos",
  },
  "/sales": {
    title: "Sales | BlockStone Printing",
    description: "Sales monitoring workspace for BlockStone Printing users.",
    robots: "noindex, nofollow",
    canonicalPath: "/sales",
  },
  "/inventory": {
    title: "Inventory | BlockStone Printing",
    description: "Inventory workspace for BlockStone Printing users.",
    robots: "noindex, nofollow",
    canonicalPath: "/inventory",
  },
  "/users": {
    title: "Users | BlockStone Printing",
    description: "User management workspace for BlockStone Printing admins.",
    robots: "noindex, nofollow",
    canonicalPath: "/users",
  },
  "/settings": {
    title: "Settings | BlockStone Printing",
    description: "System settings workspace for BlockStone Printing users.",
    robots: "noindex, nofollow",
    canonicalPath: "/settings",
  },
};

const getPageMeta = (pathname) => {
  if (ROUTE_META[pathname]) {
    return ROUTE_META[pathname];
  }

  if (pathname.startsWith("/users/")) {
    return {
      title: "User Detail | BlockStone Printing",
      description: "User details workspace for BlockStone Printing admins.",
      robots: "noindex, nofollow",
      canonicalPath: pathname,
    };
  }

  return {
    ...DEFAULT_META,
    canonicalPath: pathname || "/",
  };
};

const upsertMeta = (attribute, key, content) => {
  if (typeof document === "undefined") {
    return;
  }

  let tag = document.head.querySelector(`meta[${attribute}='${key}']`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const upsertCanonical = (href) => {
  if (typeof document === "undefined") {
    return;
  }

  let tag = document.head.querySelector("link[rel='canonical']");
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
};

const SeoManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pathname = location.pathname || "/";
    const meta = getPageMeta(pathname);
    const pageUrl = `${window.location.origin}${meta.canonicalPath || pathname}`;

    document.title = meta.title;

    upsertMeta("name", "description", meta.description);
    upsertMeta("name", "robots", meta.robots);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:url", pageUrl);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);

    upsertCanonical(pageUrl);
  }, [location.pathname]);

  return null;
};

export default SeoManager;
