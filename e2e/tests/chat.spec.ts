import { test, expect } from "@playwright/test"
import path from "path"
import fs from "fs"

const CSV_PATH = path.join(__dirname, "../fixtures/sample_revenue.csv")
const API_BASE = "http://localhost:8000"

test.describe("Chat / Query Flow", () => {
  let datasetId: string

  test.beforeEach(async ({ request }) => {
    const form = new FormData()
    form.append(
      "file",
      new Blob([fs.readFileSync(CSV_PATH)], { type: "text/csv" }),
      "sample_revenue.csv"
    )
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

  test("renders DataTable with correct column headers", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await expect(page.getByTestId("data-table")).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "Revenue" })).toBeVisible()
  })

  test("submits question and renders answer text", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await page.getByTestId("chat-input").fill("What is the total revenue?")
    await page.getByTestId("chat-submit").click()
    await expect(page.getByTestId("chat-message")).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId("answer-text")).not.toBeEmpty()
  })

  test("renders chart for comparison question", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await page.getByTestId("chat-input").fill("Compare revenue by client")
    await page.getByTestId("chat-submit").click()
    await expect(page.getByTestId("chart-container")).toBeVisible({ timeout: 30_000 })
    await expect(page.locator("[data-testid='chart-container'] svg")).toBeVisible()
  })

  test("chat history persists after page reload", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await page.getByTestId("chat-input").fill("What is the average exposure?")
    await page.getByTestId("chat-submit").click()
    await expect(page.getByTestId("chat-message")).toBeVisible({ timeout: 30_000 })
    await page.reload()
    await expect(page.getByTestId("chat-message")).toBeVisible()
  })
})
