const server = process.env.VITE_API_BASE_URL;

export const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: server,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
