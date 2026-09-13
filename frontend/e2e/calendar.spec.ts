import { expect, test } from "@playwright/test";

test("create, edit, and list a reminder from a calendar day", async ({
  page,
}) => {
  const email = `calendar+${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Calendar Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goto("/app/calendar");

  // Pick the first day cell that belongs to the current month.
  const now = new Date();
  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
  }).format(now);
  const dayCell = page
    .getByRole("button", {
      name: new RegExp(`Open reminders for .* ${monthName} ${now.getFullYear()}`),
    })
    .first();
  await dayCell.click();

  // The create modal is titled with the selected date and has no date input.
  await expect(
    page.getByRole("heading", { name: /New reminder at/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Date")).toHaveCount(0);

  await page.getByLabel("Title").fill("Dentist appointment");
  await page.getByLabel("Notes").fill("Bring insurance card");
  await page.getByLabel("Time").fill("14:30");
  await page.getByRole("button", { name: "Add reminder" }).click();

  // The new reminder appears in the day list.
  const listItem = page.getByRole("button", {
    name: /Dentist appointment/,
  });
  await expect(listItem).toBeVisible();

  // Clicking it switches the modal into edit mode.
  await listItem.click();
  await expect(
    page.getByRole("heading", { name: /Edit reminder at/ }),
  ).toBeVisible();

  const titleInput = page.getByLabel("Title");
  await titleInput.fill("Dentist appointment (moved)");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(
    page.getByRole("button", { name: /Dentist appointment \(moved\)/ }),
  ).toBeVisible();
});
