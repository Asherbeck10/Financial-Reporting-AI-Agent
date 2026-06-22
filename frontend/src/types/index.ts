export interface ColumnInfo {
  name: string
  dtype: "numeric" | "text" | "date"
  sample_values: unknown[]
  null_count: number
  unique_count: number
}

export interface UploadResponse {
  upload_id: string
  dataset_id: string
  filename: string
  row_count: number
  columns: ColumnInfo[]
}

export interface DatasetSummary {
  id: string
  name: string
  row_count: number
  columns: ColumnInfo[]
  created_at: string
}

export interface DataTableResponse {
  rows: Record<string, unknown>[]
  total: number
  page: number
  page_size: number
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface ChartConfig {
  x_label?: string
  y_label?: string
  color_scheme?: string[]
}

export interface QueryResponse {
  query_id: string
  dataset_id: string
  question: string
  answer_text: string
  chart_type: "bar" | "line" | "pie" | "table" | null
  chart_title: string | null
  chart_data: ChartDataPoint[] | null
  chart_config: ChartConfig | null
  summary_stats: Record<string, string | number> | null
  created_at: string
}
