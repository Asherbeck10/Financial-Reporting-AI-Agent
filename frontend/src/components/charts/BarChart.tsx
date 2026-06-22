import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { ChartDataPoint, ChartConfig } from "../../types"

interface Props {
  data: ChartDataPoint[]
  config: ChartConfig
}

export function BarChart({ data, config }: Props) {
  const color = config.color_scheme?.[0] ?? "#6366F1"
  const rechartData = data.map((d) => ({ name: d.label, value: d.value }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReBarChart data={rechartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          label={config.x_label ? { value: config.x_label, position: "insideBottom", offset: -4, fontSize: 11 } : undefined}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          label={config.y_label ? { value: config.y_label, angle: -90, position: "insideLeft", fontSize: 11 } : undefined}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, fontFamily: "JetBrains Mono", borderRadius: 8, border: "1px solid #E2E8F0" }}
          cursor={{ fill: "#F1F5F9" }}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}
