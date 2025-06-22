// services/flightService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Flight, FlightStats } from '@/types/flight';

const FLIGHTS_STORAGE_KEY = 'pilot_logbook_flights';

export default class FlightService  {
  static async getFlights(): Promise<Flight[]> {
    try {
      const flights = await AsyncStorage.getItem(FLIGHTS_STORAGE_KEY);
      return flights ? JSON.parse(flights) : [];
    } catch (error) {
      console.error('Error loading flights:', error);
      return [];
    }
  }

  static async saveFlight(flight: Flight): Promise<void> {
    try {
      const flights = await this.getFlights();
      const existingIndex = flights.findIndex(f => f.id === flight.id);
      
      if (existingIndex >= 0) {
        flights[existingIndex] = flight;
      } else {
        flights.push(flight);
      }
      
      await AsyncStorage.setItem(FLIGHTS_STORAGE_KEY, JSON.stringify(flights));
    } catch (error) {
      console.error('Error saving flight:', error);
      throw error;
    }
  }

  static async deleteFlight(flightId: string): Promise<void> {
    try {
      const flights = await this.getFlights();
      const filteredFlights = flights.filter(f => f.id !== flightId);
      await AsyncStorage.setItem(FLIGHTS_STORAGE_KEY, JSON.stringify(filteredFlights));
    } catch (error) {
      console.error('Error deleting flight:', error);
      throw error;
    }
  }

  static async fetchFlightData(flightNumber: string, date: string): Promise<Flight | null> {
    try {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
      
      // Check if date is in the future
      const today = new Date();
      const inputDate = new Date(date);
      if (inputDate > today) {
        throw new Error('Cannot fetch data for future dates');
      }
      
      // Format flight number
      const formattedFlightNumber = flightNumber.replace(/\s+/g, '').toUpperCase();
      const formattedDate = date;

      // Generate mock flight
      const flight = FlightService.generateMockFlightData(formattedFlightNumber, formattedDate);
      
      // Save the flight to storage
      await this.saveFlight(flight);
      
      console.log('Saved auto-filled flight:', flight.id);
      return flight;
    } catch (error) {
      console.error('Error fetching and saving flight data:', error);
      throw new Error(typeof error === 'string' ? error : (error as Error).message);
    }
  }

  static generateMockFlightData(flightNumber: string, date: string): Flight {
    // Map flight numbers to specific routes
    const routeMap: Record<string, {departure: string, arrival: string, aircraft: string}> = {
      'TEST123': {departure: 'LAX', arrival: 'JFK', aircraft: 'B737'},
      'TESTUA2402': {departure: 'ORD', arrival: 'SFO', aircraft: 'A320'},
      'TESTDL123': {departure: 'ATL', arrival: 'LAX', aircraft: 'B757'},
      'TESTAA456': {departure: 'DFW', arrival: 'MIA', aircraft: 'B737'},
      'TESTLH411': {departure: 'FRA', arrival: 'JFK', aircraft: 'A380'},
      'TESTSW789': {departure: 'MDW', arrival: 'DEN', aircraft: 'B737'},
      'TESTBA89': {departure: 'LHR', arrival: 'BOS', aircraft: 'B777'},
    };
    
    // Get route or use default
    const route = routeMap[flightNumber] || {
      departure: 'LAX',
      arrival: 'JFK',
      aircraft: 'B737'
    };
    
    // Generate random times
    const depHour = Math.floor(Math.random() * 24);
    const depMinute = Math.floor(Math.random() * 60);
    const flightHours = 1 + Math.random() * 8; // 1-9 hour flight
    const totalTime = parseFloat(flightHours.toFixed(1));
    
    const depTime = new Date(`${date}T${depHour.toString().padStart(2, '0')}:${depMinute.toString().padStart(2, '0')}:00`);
    const arrTime = new Date(depTime.getTime() + flightHours * 60 * 60 * 1000);
    
    // Calculate night time (30% of total if night flight)
    const isNight = depHour >= 18 || depHour <= 6;
    const nightTime = isNight ? parseFloat((totalTime * 0.3).toFixed(1)) : 0;
    
    return {
      id: `${flightNumber}-${date}-${Date.now()}`,
      date: date,
      flightNumber: flightNumber,
      departure: route.departure,
      arrival: route.arrival,
      departureTime: FlightService.formatTime(depTime),
      arrivalTime: FlightService.formatTime(arrTime),
      aircraftType: route.aircraft,
      registration: `N${Math.floor(1000 + Math.random() * 9000)}`,
      totalTime: totalTime,
      picTime: totalTime,
      nightTime: nightTime,
      instrumentTime: 0,
      crossCountryTime: totalTime,
      dualTime: 0,
      instructorTime: 0,
      landings: {
        day: isNight ? 0 : 1,
        night: isNight ? 1 : 0,
      },
      approaches: 0,
      remarks: `Mock data for ${flightNumber} - ${route.departure} to ${route.arrival}`,
    };
  }

  static formatTime(date: Date): string {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  static async getFlightStats(): Promise<FlightStats> {
    try {
      const flights = await this.getFlights();
      
      const stats: FlightStats = {
        totalHours: 0,
        picHours: 0,
        nightHours: 0,
        instrumentHours: 0,
        crossCountryHours: 0,
        totalFlights: flights.length,
        aircraftTypes: {},
        last30Days: 0,
        last90Days: 0,
      };

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      flights.forEach(flight => {
        const flightDate = new Date(flight.date);
        
        stats.totalHours += flight.totalTime;
        stats.picHours += flight.picTime;
        stats.nightHours += flight.nightTime;
        stats.instrumentHours += flight.instrumentTime;
        stats.crossCountryHours += flight.crossCountryTime;
        
        if (stats.aircraftTypes[flight.aircraftType]) {
          stats.aircraftTypes[flight.aircraftType] += flight.totalTime;
        } else {
          stats.aircraftTypes[flight.aircraftType] = flight.totalTime;
        }
        
        if (flightDate >= thirtyDaysAgo) {
          stats.last30Days += flight.totalTime;
        }
        if (flightDate >= ninetyDaysAgo) {
          stats.last90Days += flight.totalTime;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error calculating flight stats:', error);
      return {
        totalHours: 0,
        picHours: 0,
        nightHours: 0,
        instrumentHours: 0,
        crossCountryHours: 0,
        totalFlights: 0,
        aircraftTypes: {},
        last30Days: 0,
        last90Days: 0,
      };
    }
  }
}