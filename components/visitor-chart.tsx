"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Chart, ChartContainer, ChartTooltip, ChartLegend, ChartLegendItem } from "../components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export function VisitorChart() {
  // This would normally be fetched from an API
  const data = [
    { name: "Jan", visitors: 4000, online: 2400 },
    { name: "Feb", visitors: 3000, online: 1398 },
    { name: "Mar", visitors: 2000, online: 9800 },
    { name: "Apr", visitors: 2780, online: 3908 },
    { name: "May", visitors: 1890, online: 4800 },
    { name: "Jun", visitors: 2390, online: 3800 },
    { name: "Jul", visitors: 3490, online: 4300 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor Trends</CardTitle>
        <CardDescription>Monthly visitor statistics for in-person and online ticket purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer>
            <div className="mb-4">
              <ChartLegend>
                <ChartLegendItem name="In-person Visitors" color="#0ea5e9" />
                <ChartLegendItem name="Online Bookings" color="#8b5cf6" />
              </ChartLegend>
            </div>
            <Chart>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
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
                  <Area type="monotone" dataKey="visitors" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" />
                  <Area type="monotone" dataKey="online" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" />
                </AreaChart>
              </ResponsiveContainer>
            </Chart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

