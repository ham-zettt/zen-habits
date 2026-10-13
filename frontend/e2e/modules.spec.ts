import { expect, test } from "@playwright/test";

test("create a custom module and add an item to it", async ({ page }) => {
  const email = `module+${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Module Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Add Module" })
    .click();
  await expect(page).toHaveURL(/\/app\/modules\/new$/);

  await page.getByLabel("Module title").fill("Belanja Harian");

  // Add a text field.
  await page.getByRole("button", { name: "New field" }).click();
  await page.getByRole("button", { name: "Text" }).click();
  await page.getByLabel("Field 1 label").fill("Toko");

  // Add a dropdown field with one option.
  await page.getByRole("button", { name: "New field" }).click();
  await page.getByRole("button", { name: "Dropdown" }).click();
  await page.getByLabel("Field 2 label").fill("Status");
  await page.getByLabel("Option 1", { exact: true }).fill("Selesai");

  await page.getByRole("button", { name: "Save module" }).click();
  await expect(page).toHaveURL(/\/app\/modules\/.+/);

  // The new module shows up in the navigation.
  await expect(
    page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Belanja Harian" }),
  ).toBeVisible();

  // Add an item using the custom fields.
  await page.getByRole("button", { name: "Add item" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill("Beli sayur");
  await dialog.getByLabel("Toko").fill("Toko Amir");
  await dialog.getByLabel("Status").selectOption("Selesai");
  await dialog.getByRole("button", { name: "Add item" }).click();

  await expect(page.getByText("Beli sayur")).toBeVisible();
  await expect(page.getByText("Toko Amir")).toBeVisible();
});

test("edit a module structure by adding a field", async ({ page }) => {
  const email = `edit+${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Editor");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Study Plan" })
    .click();
  await page.getByRole("link", { name: "Edit module" }).click();
  await expect(page).toHaveURL(/\/app\/modules\/.+\/edit$/);

  // The starter module already has two fields; append a third.
  await page.getByRole("button", { name: "New field" }).click();
  await page.getByRole("button", { name: "Text" }).click();
  await page.getByLabel("Field 3 label").fill("Notes");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page).toHaveURL(/\/app\/modules\/[^/]+$/);

  // The new field appears in the add-item form.
  await page.getByRole("button", { name: "Add item" }).first().click();
  await expect(page.getByRole("dialog").getByLabel("Notes")).toBeVisible();
});
