import client from "./client"
import type { DatasetSummary, DataTableResponse } from "../types"

export async function listDatasets(): Promise<DatasetSummary[]> {
  const { data } = await client.get<DatasetSummary[]>("/datasets")
  return data
}

export async function getDataset(id: string): Promise<DatasetSummary> {
  const { data } = await client.get<DatasetSummary>(`/datasets/${id}`)
  return data
}

export async function getRows(
  datasetId: string,
  page = 1,
  pageSize = 50
): Promise<DataTableResponse> {
  const { data } = await client.get<DataTableResponse>(
    `/datasets/${datasetId}/rows`,
    { params: { page, page_size: pageSize } }
  )
  return data
}
