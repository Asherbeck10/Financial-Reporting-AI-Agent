import { create } from "zustand"
import type { DatasetSummary } from "../types"

interface AppState {
  datasets: DatasetSummary[]
  activeDatasetId: string | null
  setDatasets: (datasets: DatasetSummary[]) => void
  addDataset: (dataset: DatasetSummary) => void
  setActiveDataset: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  datasets: [],
  activeDatasetId: null,
  setDatasets: (datasets) => set({ datasets }),
  addDataset: (dataset) =>
    set((state) => ({ datasets: [dataset, ...state.datasets] })),
  setActiveDataset: (id) => set({ activeDatasetId: id }),
}))
