import client from "./client"
import type { QueryResponse } from "../types"

export async function submitQuery(
  datasetId: string,
  question: string
): Promise<QueryResponse> {
  const { data } = await client.post<QueryResponse>("/queries", {
    dataset_id: datasetId,
    question,
  })
  return data
}

export async function listQueries(datasetId: string): Promise<QueryResponse[]> {
  const { data } = await client.get<QueryResponse[]>("/queries", {
    params: { dataset_id: datasetId },
  })
  return data
}
