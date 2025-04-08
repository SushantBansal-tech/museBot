"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export function PopularExhibitions() {
  // This would normally be fetched from an API
  const data = [
    { name: "Modern Art", visitors: 4000 },
    { name: "Ancient Civilizations", visitors: 3000 },
    { name: "Digital Futures", visitors: 2000 },
    { name: "Natural History", visitors: 2780 },
    { name: "Renaissance", visitors: 1890 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Exhibitions</CardTitle>
        <CardDescription>Visitor count by exhibition</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer>
            <Chart>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="visitors" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Chart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

