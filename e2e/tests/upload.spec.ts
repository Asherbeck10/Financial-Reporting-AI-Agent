import { test, expect } from "@playwright/test"
import path from "path"

const CSV_PATH = path.join(__dirname, "../fixtures/sample_revenue.csv")

test.describe("CSV Upload Flow", () => {
  test("uploads a CSV and redirects to chat page", async ({ page }) => {
    await page.goto("/")
    const input = page.locator('[data-testid="upload-dropzone"] input[type="file"]')
    await input.setInputFiles(CSV_PATH)
    await expect(page.getByTestId("upload-progress")).toBeVisible()
    await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}/, { timeout: 30_000 })
  })

  test("shows error for unsupported file type", async ({ page }) => {
    await page.goto("/")
    const input = page.locator('[data-testid="upload-dropzone"] input[type="file"]')
    await input.setInputFiles({
      name: "bad.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not a csv"),
    })
    await expect(page.getByTestId("upload-error")).toBeVisible()
    await expect(page.getByTestId("upload-error")).toContainText("Only CSV and Excel")
  })
})
