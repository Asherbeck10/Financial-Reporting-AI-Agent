import type { ChartDataPoint, ChartConfig } from "../../types"
import { BarChart } from "./BarChart"
import { LineChart } from "./LineChart"
import { PieChart } from "./PieChart"

interface Props {
  type: "bar" | "line" | "pie" | "table"
  title: string
  data: ChartDataPoint[]
  config: ChartConfig
}

export function Chart({ type, title, data, config }: Props) {
  return (
    <div className="space-y-2">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          {title}
        </p>
      )}
      {type === "bar" && <BarChart data={data} config={config} />}
      {type === "line" && <LineChart data={data} config={config} />}
      {type === "pie" && <PieChart data={data} config={config} />}
      {type === "table" && (
        <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
          <table className="min-w-full text-xs font-data">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-50">
                <th className="px-3 py-2 text-left text-[#64748B]">Label</th>
                <th className="px-3 py-2 text-right text-[#64748B]">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-2 text-[#0F172A]">{d.label}</td>
                  <td className="px-3 py-2 text-right text-[#0F172A]">
                    {d.value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
