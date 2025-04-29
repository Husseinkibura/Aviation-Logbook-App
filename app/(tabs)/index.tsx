// app/(tabs)/index.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { getFlights } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { Clock, Plane, MapPin, Calendar, ChevronDown } from 'lucide-react-native';

interface Flight {
  id: string;
  departure_airport: string;
  arrival_airport: string;
  start_time: string;
  total_hours: number;
  aircraft_type: string;
  flight_number: string;
  conditions: string[];
}

export default function FlightsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    nightHours: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const processFlights = (data: Flight[]) => {
    const totalHours = data.reduce((sum, flight) => sum + flight.total_hours, 0);
    const nightHours = data.reduce((sum, flight) => 
      flight.conditions.includes('Night') ? sum + flight.total_hours : sum, 0
    );
    
    const currentMonth = new Date().getMonth();
    const thisMonth = data.filter(flight => 
      new Date(flight.start_time).getMonth() === currentMonth
    ).length;

    setStats({ totalHours, nightHours, thisMonth });
    setFlights(data);
  };

  const fetchFlights = async () => {
    try {
      const response = await getFlights();
      processFlights(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch flights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFlights();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <Text style={{ color: isDark ? '#fff' : '#1e293b', textAlign: 'center' }}>Loading flights...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <Text style={{ color: isDark ? '#fff' : '#1e293b', textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={fetchFlights} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=2940&auto=format&fit=crop' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>Flight Log</Text>
          <Text style={styles.headerSubtitle}>Track your aviation journey</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[isDark ? '#60a5fa' : '#2563eb']}
          />
        }
      >
        {/* <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {stats.totalHours.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Total Hours</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {stats.nightHours.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Night Hours</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {stats.thisMonth}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>This Month</Text>
          </View>
        </View> */}

<View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Clock size={24} color="#60a5fa" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {stats.totalHours.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Total Hours
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Plane size={24} color="#34d399" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {stats.nightHours.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Night Hours
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Calendar size={24} color="#f59e0b" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {stats.thisMonth}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              This Month
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Recent Flights</Text>
        
        {flights.slice(0, 3).map((flight) => (
          <View key={flight.id} style={[styles.flightCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.flightHeader}>
              <Text style={[styles.flightDate, { color: isDark ? '#fff' : '#1e293b' }]}>
                {format(parseISO(flight.start_time), 'MMM d, yyyy')}
              </Text>
              <Text style={[styles.flightDuration, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {flight.total_hours.toFixed(1)}h
              </Text>
            </View>
            <View style={styles.flightRoute}>
              <Text style={[styles.flightAirport, { color: isDark ? '#fff' : '#1e293b' }]}>
                {flight.departure_airport}
              </Text>
              <View style={[styles.flightArrow, { backgroundColor: isDark ? '#2d3748' : '#e2e8f0' }]} />
              <Text style={[styles.flightAirport, { color: isDark ? '#fff' : '#1e293b' }]}>
                {flight.arrival_airport}
              </Text>
            </View>
            <Text style={[styles.flightDetails, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {flight.aircraft_type} • {flight.flight_number} • PIC
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: isDark ? '#60a5fa' : '#2563eb' }]}
        onPress={() => router.push('/new')}
      >
        <Plus color="white" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  flightCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flightDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  flightDuration: {
    fontSize: 16,
    color: '#64748b',
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flightAirport: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  flightArrow: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  flightDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  retryButton: {
    marginTop: 16,
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#60a5fa',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});