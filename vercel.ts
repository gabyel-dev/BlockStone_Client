const server = process.env.VITE_BACKEND_URL;

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
