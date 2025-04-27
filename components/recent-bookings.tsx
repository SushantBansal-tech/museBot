"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";

export function RecentBookings() {
  // This would normally be fetched from an API
  const bookings = [
    {
      id: "B-1234",
      name: "John Smith",
      email: "john@example.com",
      date: "2023-07-15",
      tickets: 2,
      amount: "$30.00",
      status: "completed",
    },
    {
      id: "B-1235",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      date: "2023-07-16",
      tickets: 4,
      amount: "$60.00",
      status: "completed",
    },
    {
      id: "B-1236",
      name: "Michael Brown",
      email: "michael@example.com",
      date: "2023-07-18",
      tickets: 1,
      amount: "$15.00",
      status: "pending",
    },
    {
      id: "B-1237",
      name: "Emily Davis",
      email: "emily@example.com",
      date: "2023-07-20",
      tickets: 3,
      amount: "$45.00",
      status: "completed",
    },
    {
      id: "B-1238",
      name: "David Wilson",
      email: "david@example.com",
      date: "2023-07-22",
      tickets: 2,
      amount: "$30.00",
      status: "cancelled",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>
          Latest ticket bookings and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Visit Date</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {booking.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{booking.name}</span>
                      <span className="text-xs text-muted-foreground">{booking.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.tickets}</TableCell>
                <TableCell>{booking.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize flex items-center">
                    <div className={`mr-1.5 h-2 w-2 rounded-full ${getStatusColor(booking.status)}`} />
                    {booking.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
