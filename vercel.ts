const apiOriginRaw = process.env.VITE_BACKEND_ORIGIN;
const apiOrigin = apiOriginRaw?.replace(/\/+$/, "");

export default {
  rewrites: [
    {
      source: "/api/:path*",
      destination: `${apiOrigin}/api/:path*`,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
