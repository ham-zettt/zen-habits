import { expect, test } from "@playwright/test";

test("register, add a task, toggle it, and sign out", async ({ page }) => {
  const email = `smoke+${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Smoke Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole("heading", { name: "Your day, in one place" }),
  ).toBeVisible();

  await page.goto("/app/todos");
  await page.getByLabel("Task name").fill("Buy milk");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText("Buy milk")).toBeVisible();

  const checkbox = page.getByRole("checkbox", { name: /Mark "Buy milk"/ });
  await checkbox.click();
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
