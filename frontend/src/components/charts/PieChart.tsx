import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { ChartDataPoint, ChartConfig } from "../../types"

interface Props {
  data: ChartDataPoint[]
  config: ChartConfig
}

const DEFAULT_COLORS = ["#6366F1", "#059669", "#F59E0B", "#DC2626", "#8B5CF6", "#0EA5E9"]

export function PieChart({ data, config }: Props) {
  const colors = config.color_scheme ?? DEFAULT_COLORS
  const rechartData = data.map((d) => ({ name: d.label, value: d.value }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RePieChart>
        <Pie
          data={rechartData}
          cx="50%"
          cy="45%"
          outerRadius={90}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
          }
          labelLine={false}
        >
          {rechartData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 12, fontFamily: "JetBrains Mono", borderRadius: 8, border: "1px solid #E2E8F0" }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
      </RePieChart>
    </ResponsiveContainer>
  )
}
