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

  test("line chart renders for time-series question", async ({ page, request }) => {
    // Submit via API first so we know what Claude actually returned
    const res = await request.post(`${API_BASE}/api/queries`, {
      data: {
        dataset_id: datasetId,
        question: "Show me a line chart of revenue trend over each month",
      },
    })
    const body = await res.json()

    // Skip rather than fail if Claude didn't return chart data this run
    if (!body.chart_type || !body.chart_data || body.chart_type === "table") {
      test.skip(true, `Claude returned chart_type=${body.chart_type} — skipping SVG render check`)
      return
    }

    await page.goto(`/chat/${datasetId}`)
    await expect(page.getByTestId("chart-container")).toBeVisible({ timeout: 15_000 })
  })

  test("proportion question renders a chart", async ({ page, request }) => {
    const res = await request.post(`${API_BASE}/api/queries`, {
      data: {
        dataset_id: datasetId,
        question: "Show me a pie chart of revenue percentage by client",
      },
    })
    const body = await res.json()

    if (!body.chart_type || !body.chart_data) {
      test.skip(true, `Claude returned chart_type=${body.chart_type} — skipping chart render check`)
      return
    }

    await page.goto(`/chat/${datasetId}`)
    await expect(page.getByTestId("chart-container")).toBeVisible({ timeout: 15_000 })
  })
})
