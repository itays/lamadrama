import { expect, test } from "@playwright/test"

test("home page renders and hydrates", { tag: "@smoke" }, async ({ page }) => {
  const pageErrors: Error[] = []
  page.on("pageerror", (error) => pageErrors.push(error))

  await page.goto("/")

  await expect(page).toHaveTitle("TanStack Start Starter")
  await expect(
    page.getByRole("heading", { name: "Project ready!" })
  ).toBeVisible()

  const counter = page.getByRole("button", { name: "Count: 0" })
  await expect(counter).toBeEnabled()
  await counter.click()
  await expect(page.getByRole("button", { name: "Count: 1" })).toBeVisible()

  expect(pageErrors).toEqual([])
})
