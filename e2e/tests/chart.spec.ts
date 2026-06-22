import { test, expect } from "@playwright/test"
import path from "path"
import fs from "fs"

const CSV_PATH = path.join(__dirname, "../fixtures/sample_revenue.csv")
const API_BASE = "http://localhost:8000"

test.describe("Chart Rendering", () => {
  let datasetId: string

  test.beforeEach(async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/uploads`, {
      multipart: {
        file: {
          name: "sample_revenue.csv",
          mimeType: "text/csv",
          buffer: fs.readFileSync(CSV_PATH),
        },
      },
    })
    const body = await res.json()
    datasetId = body.dataset_id
  })

  test("line chart renders for time-series question", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await page.getByTestId("chat-input").fill("Show revenue trend over months")
    await page.getByTestId("chat-submit").click()
    await expect(page.getByTestId("chart-container")).toBeVisible({ timeout: 30_000 })
    await expect(page.locator(".recharts-line-curve, .recharts-bar-rectangle")).toBeVisible()
  })

  test("proportion question renders a chart", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await page.getByTestId("chat-input").fill("What percentage of revenue comes from each client?")
    await page.getByTestId("chat-submit").click()
    await expect(page.getByTestId("chart-container")).toBeVisible({ timeout: 30_000 })
    await expect(page.locator("[data-testid='chart-container'] svg")).toBeVisible()
  })
})
