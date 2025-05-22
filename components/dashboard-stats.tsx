"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Users, Ticket, TrendingUp, DollarSign } from "lucide-react"

export function DashboardStats() {
  // This would normally be fetched from an API
  const stats = [
    {
      title: "Total Visitors",
      value: "12,543",
      change: "+14%",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "vs. previous month",
    },
    {
      title: "Tickets Sold",
      value: "8,392",
      change: "+23%",
      icon: <Ticket className="h-4 w-4 text-muted-foreground" />,
      description: "vs. previous month",
    },
    {
      title: "Revenue",
      value: "$124,675",
      change: "+18%",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      description: "vs. previous month",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.4%",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "vs. previous month",
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>{stat.change}</span>
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

