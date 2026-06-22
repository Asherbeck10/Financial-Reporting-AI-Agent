import { test, expect } from "@playwright/test"
import path from "path"
import fs from "fs"

const CSV_PATH = path.join(__dirname, "../fixtures/sample_revenue.csv")
const API_BASE = "http://localhost:8000"

test.describe("Chat / Query Flow", () => {
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

  test("renders DataTable with correct column headers", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await expect(page.getByTestId("data-table")).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "Revenue" })).toBeVisible()
  })

  test("submits question and renders answer text", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await page.getByTestId("chat-input").fill("What is the total revenue?")
    await page.getByTestId("chat-submit").click()
    // wait for the real answer, not just the loading spinner
    await expect(page.getByTestId("answer-text")).toBeVisible({ timeout: 60_000 })
    await expect(page.getByTestId("answer-text")).not.toBeEmpty()
  })

  test("renders chart for comparison question", async ({ page, request }) => {
    const res = await request.post(`${API_BASE}/api/queries`, {
      data: {
        dataset_id: datasetId,
        question: "Show me a bar chart comparing total revenue by client",
      },
    })
    const body = await res.json()

    if (!body.chart_type || !body.chart_data || body.chart_type === "table") {
      test.skip(true, `Claude returned chart_type=${body.chart_type} — skipping SVG render check`)
      return
    }

    await page.goto(`/chat/${datasetId}`)
    await expect(page.getByTestId("chart-container")).toBeVisible({ timeout: 15_000 })
  })

  test("chat history persists after page reload", async ({ page }) => {
    await page.goto(`/chat/${datasetId}`)
    await page.getByTestId("chat-input").fill("What is the average exposure?")
    await page.getByTestId("chat-submit").click()
    // wait for the answer to be saved before reloading
    await expect(page.getByTestId("answer-text")).toBeVisible({ timeout: 60_000 })
    await page.reload()
    await expect(page.getByTestId("chat-message")).toBeVisible({ timeout: 30_000 })
  })
})
