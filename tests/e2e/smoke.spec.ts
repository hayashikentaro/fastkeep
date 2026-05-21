import { expect, test, type Page } from "@playwright/test";

const ignoredResponsePatterns = [/favicon\.ico/, /\/\.well-known\//];

function installStrictBrowserChecks(page: Page) {
  const failures: string[] = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      failures.push(`console:${message.type()}: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    failures.push(`pageerror: ${error.message}`);
  });

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();
    const request = response.request();
    const resourceType = request.resourceType();

    if (
      status >= 400 &&
      ["document", "script", "stylesheet", "xhr", "fetch"].includes(resourceType) &&
      !ignoredResponsePatterns.some((pattern) => pattern.test(url))
    ) {
      failures.push(`${resourceType} ${status}: ${url}`);
    }
  });

  return failures;
}

async function expectHealthyPage(page: Page, failures: string[]) {
  await expect(page.locator("body")).not.toHaveText("");
  await expect(page.getByText("Unhandled Runtime Error")).toHaveCount(0);
  await expect(page.getByText("Application error")).toHaveCount(0);
  await expect(page.getByText("cookies is not iterable")).toHaveCount(0);
  expect(failures).toEqual([]);
}

test("ログイン画面は白画面・重大ブラウザエラーなしで表示できる", async ({ page }) => {
  const failures = installStrictBrowserChecks(page);

  const response = await page.goto("/login");
  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { name: "すばやく残して、必要な時刻へ。" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ログインリンクを送る" })).toBeVisible();
  await expectHealthyPage(page, failures);
});

test("トップ画面は runtime error を出さずログイン画面またはメモ画面を表示する", async ({ page }) => {
  const failures = installStrictBrowserChecks(page);

  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByText(/FastKeep/).first()).toBeVisible();
  await expectHealthyPage(page, failures);
});

test("サーバー runtime smoke が成功する", async ({ request }) => {
  const response = await request.get("/api/smoke/runtime");
  expect(response.status()).toBe(200);
  await expect(response).toBeOK();
  const body = await response.json();
  expect(body.ok).toBe(true);
});
