// app/(tabs)/logbook.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Search, Filter, Cloud, Pencil, ChevronDown, ChevronUp } from 'lucide-react-native';
import FlightService from '@/services/flightService';
import { useTheme } from '@/context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { Flight } from '@/types/flight';

export default function LogbookScreen() {
  const { isDark } = useTheme();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [newFlightsCount, setNewFlightsCount] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    manual: true,
    automatic: true,
  });

  const fetchFlights = useCallback(async () => {
    try {
      const flights = await FlightService.getFlights();
      setFlights(flights);
      setError('');
      
      // Track if new flights were added
      if (flights.length > flights.length) {
        setNewFlightsCount(flights.length - flights.length);
        setTimeout(() => setNewFlightsCount(0), 3000);
      }
    } catch (err) {
      setError('Failed to fetch flights');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchFlights();
    }, [fetchFlights])
  );

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFlights();
  };

  const toggleSection = (section: 'manual' | 'automatic') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Categorize flights
  const manualFlights = flights.filter(flight => 
    !flight.remarks.includes('Mock data') && 
    !flight.remarks.includes('Auto-filled')
  );
  
  const automaticFlights = flights.filter(flight => 
    flight.remarks.includes('Mock data') || 
    flight.remarks.includes('Auto-filled')
  );

  const sections = [
    // {
    //   title: 'Manual Flights',
    //   key: 'manual',
    //   data: manualFlights,
    //   icon: Pencil,
    //   color: isDark ? '#a78bfa' : '#7c3aed',
    // },
    {
      title: 'Automatic Flights',
      key: 'automatic',
      data: automaticFlights,
      icon: Cloud,
      color: isDark ? '#60a5fa' : '#2563eb',
    }
  ];

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

  const renderTable = (flights: Flight[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={{ marginBottom: 16, minWidth: 900 }}>
        {/* Table Header */}
        <View style={[styles.tableRow, { backgroundColor: isDark ? '#1f2937' : '#e2e8f0' }]}>
          <Text style={[styles.cellHeader, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>Date</Text>
          <Text style={[styles.cellHeader, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>Flight #</Text>
          <Text style={[styles.cellHeader, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>Aircraft</Text>
          <Text style={[styles.cellHeader, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>Duration</Text>
          <Text style={[styles.cellHeader, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>Dep</Text>
          <Text style={[styles.cellHeader, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>Arr</Text>
          <Text style={[styles.cellHeader, { flex: 1.5, color: isDark ? '#fff' : '#1e293b' }]}>From → To</Text>
          <Text style={[styles.cellHeader, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>Type</Text>
        </View>

        {/* Table Rows */}
        {flights.map((flight) => (
          <View
            key={flight.id}
            style={[
              styles.tableRow,
              {
                borderBottomColor: isDark ? '#334155' : '#e2e8f0',
                borderBottomWidth: 1,
              },
            ]}
          >
            <Text style={[styles.cell, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.date}
            </Text>
            <Text style={[styles.cell, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.flightNumber}
            </Text>
            <Text style={[styles.cell, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.aircraftType}
            </Text>
            <Text style={[styles.cell, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.totalTime.toFixed(1)} hrs
            </Text>
            <Text style={[styles.cell, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.departureTime}
            </Text>
            <Text style={[styles.cell, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.arrivalTime}
            </Text>
            <Text style={[styles.cell, { flex: 1.5, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.departure} → {flight.arrival}
            </Text>
            <Text style={[styles.cell, { flex: 1, color: isDark ? '#fff' : '#1e293b' }]}>
              {flight.crossCountryTime > 0 ? 'Cross Country' : 'Local'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

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
            title={newFlightsCount > 0 ? `${newFlightsCount} new flights` : null}
          />
        }
      >
        {flights.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              No flights recorded yet
            </Text>
            <Text style={[styles.hintText, { color: isDark ? '#64748b' : '#94a3b8' }]}>
              Use the "+" tab to add your first flight
            </Text>
          </View>
        ) : (
          <View>
            {sections.map((section) => (
              <View key={section.key} style={styles.sectionContainer}>
                <TouchableOpacity 
                  onPress={() => toggleSection(section.key as 'manual' | 'automatic')}
                  style={styles.sectionHeader}
                >
                  <View style={styles.sectionTitleContainer}>
                    <section.icon size={20} color={section.color} />
                    <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
                      {section.title} ({section.data.length})
                    </Text>
                  </View>
                  {expandedSections[section.key as 'manual' | 'automatic'] ? (
                    <ChevronUp size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                  ) : (
                    <ChevronDown size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                  )}
                </TouchableOpacity>
                
                {expandedSections[section.key as 'manual' | 'automatic'] && (
                  section.data.length > 0 ? (
                    renderTable(section.data)
                  ) : (
                    <View style={styles.emptySection}>
                      <Text style={[styles.emptySectionText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                        No {section.title.toLowerCase()} found
                      </Text>
                    </View>
                  )
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
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
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
  },
  hintText: {
    fontSize: 14,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cellHeader: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  cell: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySectionText: {
    fontSize: 14,
  },
});