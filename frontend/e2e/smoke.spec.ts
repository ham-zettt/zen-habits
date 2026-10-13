import { expect, test } from "@playwright/test";

test("register, add an item, toggle it, and sign out", async ({ page }) => {
  const email = `smoke+${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Smoke Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/app$/);

  // The default Todo List module is seeded on registration.
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Todo List" })
    .click();
  await expect(page).toHaveURL(/\/app\/modules\/.+/);

  await page.getByRole("button", { name: "Add item" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill("Buy milk");
  await dialog.getByLabel("Status").selectOption("Urgent");
  await dialog.getByRole("button", { name: "Add item" }).click();

  await expect(page.getByText("Buy milk")).toBeVisible();

  await page.getByRole("checkbox", { name: /Mark "Buy milk"/ }).click();
  await expect(
    page.getByRole("checkbox", { name: /Mark "Buy milk" as not done/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("unauthenticated visitors are sent to login", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});
