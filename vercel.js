const server = import.meta.env.VITE_API_BASE_URL;

export const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: "https://blockstone-server.onrender.com",
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
