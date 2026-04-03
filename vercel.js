const server =
  process.env.BACKEND_ORIGIN ||
  process.env.VITE_API_BASE_URL ||
  "https://blockstone-server.onrender.com";
const normalizedServer = server.replace(/\/+$/, "");

export const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: `${normalizedServer}/api/:path*`,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
