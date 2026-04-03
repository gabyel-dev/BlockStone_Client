const apiOriginRaw =
  process.env.BACKEND_ORIGIN ||
  process.env.VITE_BACKEND_ORIGIN ||
  "https://blockstone-server.onrender.com";
const apiOrigin = apiOriginRaw.replace(/\/+$/, "");
const apiDestination = `${apiOrigin}/api/:path*`;

export const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: apiDestination,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
