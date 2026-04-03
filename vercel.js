export const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: import.meta.env.VITE_API_BASE_URL,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};
