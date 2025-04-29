// app/(tabs)/logbook.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Search, Filter } from 'lucide-react-native';
import { getFlights } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { format, parseISO } from 'date-fns';

interface Flight {
  id: string;
  departure_airport: string;
  arrival_airport: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  aircraft_type: string;
  flight_number: string;
  conditions: string[];
}

export default function LogbookScreen() {
  const { isDark } = useTheme();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFlights = async () => {
    try {
      const response = await getFlights();
      setFlights(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch flights');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFlights();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <Text style={{ color: isDark ? '#fff' : '#1e293b' }}>Loading flights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <Text style={{ color: isDark ? '#fff' : '#1e293b' }}>{error}</Text>
        <TouchableOpacity onPress={fetchFlights} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Logbook</Text>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
            <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.searchPlaceholder, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Search flights...
            </Text>
          </View>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
            <Filter size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDark ? '#60a5fa' : '#2563eb']}
          />
        }
      >
        {flights.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              No flights recorded yet
            </Text>
          </View>
        ) : (
          flights.map((flight) => (
            <TouchableOpacity
              key={flight.id}
              style={[styles.logEntry, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
            >
              <View style={styles.logHeader}>
                <Text style={[styles.logDate, { color: isDark ? '#fff' : '#1e293b' }]}>
                  {format(parseISO(flight.start_time), 'MMM dd, yyyy')}
                </Text>
                {flight.conditions.length > 0 && (
                  <Text style={styles.logType}>
                    {flight.conditions[0]}
                  </Text>
                )}
              </View>

              <View style={styles.flightInfo}>
                <View style={styles.infoColumn}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    Aircraft
                  </Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#1e293b' }]}>
                    {flight.aircraft_type}
                  </Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    Duration
                  </Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#1e293b' }]}>
                    {flight.total_hours.toFixed(1)} hrs
                  </Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <Text style={[styles.routeAirport, { color: isDark ? '#fff' : '#1e293b' }]}>
                    {flight.departure_airport}
                  </Text>
                  <Text style={[styles.routeTime, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    {format(parseISO(flight.start_time), 'HH:mm')}
                  </Text>
                </View>
                <View style={[styles.routeLine, { backgroundColor: isDark ? '#2d3748' : '#e2e8f0' }]} />
                <View style={styles.routePoint}>
                  <Text style={[styles.routeAirport, { color: isDark ? '#fff' : '#1e293b' }]}>
                    {flight.arrival_airport}
                  </Text>
                  <Text style={[styles.routeTime, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    {format(parseISO(flight.end_time), 'HH:mm')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchPlaceholder: {
    color: '#64748b',
    flex: 1,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logEntry: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  logType: {
    fontSize: 14,
    color: '#60a5fa',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flightInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routePoint: {
    alignItems: 'center',
  },
  routeAirport: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  routeTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
});