"use client"

import type * as React from "react"

const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-md p-2 shadow-md">
        <p className="font-bold">{`${label}`}</p>
        {payload.map((item, index) => (
          <p key={`item-${index}`} className="text-gray-700">
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    )
  }

  return null
}

interface ChartLegendItemProps {
  name: string
  color: string
}

const ChartLegendItem: React.FC<ChartLegendItemProps> = ({ name, color }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{name}</span>
    </div>
  )
}

const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-center space-x-4">{children}</div>
}

const Chart = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export { Chart, ChartContainer, ChartTooltip, ChartLegend, ChartLegendItem }

