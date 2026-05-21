import { defineConfig, devices } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const port = Number(process.env.PORT || 3100);

function readDotEnv(path: string) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, "")];
      })
  );
}

const localEnv = readDotEnv(".env.local");

function envValue(name: string, fallback: string) {
  return process.env[name] || localEnv[name] || fallback;
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: `npm run dev -- -H 127.0.0.1 -p ${port}`,
    url: `http://127.0.0.1:${port}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL:
        envValue("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co"),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        envValue(
          "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
          envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY", "dummy")
        ),
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        envValue(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          envValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "dummy")
        ),
      SUPABASE_SECRET_KEY:
        envValue("SUPABASE_SECRET_KEY", envValue("SUPABASE_SERVICE_ROLE_KEY", "dummy")),
      SUPABASE_SERVICE_ROLE_KEY:
        envValue("SUPABASE_SERVICE_ROLE_KEY", envValue("SUPABASE_SECRET_KEY", "dummy")),
      GOOGLE_CLIENT_ID: envValue("GOOGLE_CLIENT_ID", "dummy"),
      GOOGLE_CLIENT_SECRET: envValue("GOOGLE_CLIENT_SECRET", "dummy"),
      APP_BASE_URL: envValue("APP_BASE_URL", `http://127.0.0.1:${port}`),
      GOOGLE_REDIRECT_URI:
        envValue("GOOGLE_REDIRECT_URI", `http://127.0.0.1:${port}/auth/google/callback`),
      ENABLE_RUNTIME_SMOKE: "1",
      RUN_SUPABASE_SMOKE: process.env.RUN_SUPABASE_SMOKE || "0"
    }
  }
});
