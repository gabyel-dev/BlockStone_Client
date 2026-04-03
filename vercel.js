const server =
  import.meta.env.VITE_API_BASE_URL || "https://blockstone-server.onrender.com";

export const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: `${server}`,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
