import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(
  /\/+$/,
  "",
);

// On Vercel the backend is a separate deployment. Fail the build early rather
// than silently proxying to localhost in production.
if (process.env.VERCEL && !process.env.BACKEND_URL) {
  throw new Error(
    "BACKEND_URL is required on Vercel. Set it to the deployed backend URL, e.g. https://zenhabits-api.vercel.app",
  );
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Keep the browser same-origin: the Next server proxies /api/* to the
        // Go backend, so the httpOnly auth cookies stay first-party.
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
