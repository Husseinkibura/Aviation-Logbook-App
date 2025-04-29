// app/(tabs)/stats.tsx

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { getFlights } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface Flight {
  id: string;
  total_hours: number;
  conditions: string[];
  aircraft_type: string;
  start_time: string;
}

interface Stats {
  totalHours: number;
  nightHours: number;
  ifrHours: number;
  aircraftTypes: { [key: string]: number };
  monthlyActivity: { month: string; hours: number }[];
}

export default function StatsScreen() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<Stats>({
    totalHours: 0,
    nightHours: 0,
    ifrHours: 0,
    aircraftTypes: {},
    monthlyActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const processFlights = (flights: Flight[]) => {
    const totalHours = flights.reduce((sum, flight) => sum + flight.total_hours, 0);
    const nightHours = flights.reduce((sum, flight) => 
      flight.conditions.includes('Night') ? sum + flight.total_hours : sum, 0
    );
    const ifrHours = flights.reduce((sum, flight) => 
      flight.conditions.includes('IFR') ? sum + flight.total_hours : sum, 0
    );

    // Aircraft type breakdown
    const aircraftTypes = flights.reduce((acc, flight) => ({
      ...acc,
      [flight.aircraft_type]: (acc[flight.aircraft_type] || 0) + flight.total_hours
    }), {});

    // Last 6 months activity
    const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: format(date, 'MMM'),
        hours: flights.filter(f => 
          format(parseISO(f.start_time), 'MMM') === format(date, 'MMM')
        ).reduce((sum, f) => sum + f.total_hours, 0)
      };
    }).reverse();

    setStats({ totalHours, nightHours, ifrHours, aircraftTypes, monthlyActivity });
  };

  const fetchData = async () => {
    try {
      const response = await getFlights();
      processFlights(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const maxChartHeight = Math.max(...stats.monthlyActivity.map(m => m.hours), 1) || 1;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Statistics</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Your flight metrics at a glance
        </Text>
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
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Flight Hours Breakdown
          </Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#1e293b' }]}>
                {stats.totalHours.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#1e293b' }]}>
                {stats.nightHours.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Night</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#1e293b' }]}>
                {stats.ifrHours.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>IFR</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Aircraft Utilization
          </Text>
          {Object.entries(stats.aircraftTypes).map(([type, hours]) => (
            <View key={type} style={styles.aircraftRow}>
              <Text style={[styles.aircraftType, { color: isDark ? '#fff' : '#1e293b' }]}>
                {type}
              </Text>
              <View style={[styles.progressBar, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: `${(hours / stats.totalHours) * 100}%`,
                    backgroundColor: isDark ? '#60a5fa' : '#2563eb'
                  }
                ]} />
              </View>
              <Text style={[styles.aircraftHours, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {hours.toFixed(1)}h
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Monthly Activity
          </Text>
          <View style={styles.activityChart}>
            {stats.monthlyActivity.map((month, index) => (
              <View key={index} style={styles.chartColumn}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: (month.hours / maxChartHeight) * 100,
                      backgroundColor: isDark ? '#60a5fa' : '#2563eb'
                    }
                  ]} 
                />
                <Text style={[styles.chartLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {month.month}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Certifications section can be added when backend support is available */}
      </ScrollView>
    </View>
  );
}

// Keep your existing styles and add/modify these:
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  aircraftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aircraftType: {
    width: 60,
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  aircraftHours: {
    width: 40,
    fontSize: 14,
    textAlign: 'right',
  },
  activityChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: 20,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
  },
});