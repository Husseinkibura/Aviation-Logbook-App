// types/flight.ts
export interface Flight {
  id: string;
  date: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  aircraftType: string;
  registration: string;
  totalTime: number;
  picTime: number;
  nightTime: number;
  instrumentTime: number;
  crossCountryTime: number;
  dualTime: number;
  instructorTime: number;
  landings: {
    day: number;
    night: number;
  };
  approaches: number;
  remarks: string;
  source: 'manual' | 'automatic'; // Add source field
}

export interface FlightStats {
  totalHours: number;
  picHours: number;
  nightHours: number;
  instrumentHours: number;
  crossCountryHours: number;
  totalFlights: number;
  aircraftTypes: Record<string, number>;
  last30Days: number;
  last90Days: number;
}