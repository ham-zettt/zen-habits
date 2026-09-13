import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "bash -c 'cd ../backend && go build -o /tmp/opencode/zen-e2e . && exec /tmp/opencode/zen-e2e'",
      url: "http://localhost:8080/api/health",
      reuseExistingServer: true,
      timeout: 90_000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 90_000,
    },
  ],
});
