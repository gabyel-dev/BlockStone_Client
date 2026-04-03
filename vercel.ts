export const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: "https://blockstone-server.onrender.com/api/:path*",
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
