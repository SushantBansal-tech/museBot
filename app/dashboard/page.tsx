import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import { DashboardStats } from "../../components/dashboard-stats"
import { VisitorChart } from "../../components/visitor-chart"
import { RecentBookings } from "../../components/recent-bookings"
import { PopularExhibitions } from "../../components/popular-exhibitions"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-6 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tighter">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Monitor ticket sales, visitor statistics, and museum performance </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <DashboardStats />
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <VisitorChart />
            <PopularExhibitions />
          </div>

          <RecentBookings />
        </div>
      </main>
      <Footer />
    </div>
  )
}

