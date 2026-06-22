import { useEffect } from "react"
import { listDatasets } from "../api/datasets"
import { useAppStore } from "../store/appStore"

export function useDatasets() {
  const { datasets, setDatasets } = useAppStore()

  useEffect(() => {
    listDatasets().then(setDatasets).catch(console.error)
  }, [setDatasets])

  return datasets
}
