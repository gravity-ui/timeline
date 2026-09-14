import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:6006",
    browserName: "chromium",
  },
  webServer: {
    command: "npm run storybook -- --ci --no-open",
    port: 6006,
    reuseExistingServer: !process.env.CI,
  },
});
