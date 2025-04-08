// New component: components/MuseumCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MuseumCardProps = {
  museum: {
    _id: string;
    name: string;
    description: string;
    location: string;
    ticketPrice: number;
    timeStart: string;
    timeEnd: string;
    ratings: number;
  };
  onBookClick: (museumId: string) => void;
  onInfoClick: (museumId: string) => void;
}

export function MuseumCard({ museum, onBookClick, onInfoClick }: MuseumCardProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{museum.name}</CardTitle>
        <CardDescription>{museum.location}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Price:</span> ${museum.ticketPrice}
          </div>
          <div>
            <span className="font-medium">Hours:</span> {museum.timeStart}-{museum.timeEnd}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Rating:</span> {museum.ratings}/5
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onInfoClick(museum._id)}
        >
          More Info
        </Button>
        <Button 
          size="sm"
          onClick={() => onBookClick(museum._id)}
        >
          Book Tickets
        </Button>
      </CardFooter>
    </Card>
  )
}