// app/analytics.tsx

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Clock, Plane, MapPin, Calendar, ChevronDown } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);

  const flightData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 35, 42, 38],
        color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
      }
    ]
  };

  const aircraftData = {
    labels: ['C172', 'PA28', 'BE36', 'C152'],
    datasets: [
      {
        data: [35, 28, 15, 22]
      }
    ]
  };

  const flightTypeData = [
    {
      name: 'Training',
      population: 45,
      color: '#60a5fa',
      legendFontColor: isDark ? '#fff' : '#1e293b',
    },
    {
      name: 'Cross Country',
      population: 28,
      color: '#34d399',
      legendFontColor: isDark ? '#fff' : '#1e293b',
    },
    {
      name: 'Night',
      population: 15,
      color: '#f59e0b',
      legendFontColor: isDark ? '#fff' : '#1e293b',
    },
    {
      name: 'IFR',
      population: 12,
      color: '#ef4444',
      legendFontColor: isDark ? '#fff' : '#1e293b',
    }
  ];

  const chartConfig = {
    backgroundColor: isDark ? '#1e293b' : '#fff',
    backgroundGradientFrom: isDark ? '#1e293b' : '#fff',
    backgroundGradientTo: isDark ? '#1e293b' : '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(30, 41, 59, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Analytics</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Flight statistics and insights
        </Text>
      </View>

      <View style={[styles.timeRangeContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <TouchableOpacity
          style={styles.timeRangeButton}
          onPress={() => setShowRangeDropdown(!showRangeDropdown)}
        >
          <Calendar size={20} color={isDark ? '#fff' : '#1e293b'} />
          <Text style={[styles.timeRangeText, { color: isDark ? '#fff' : '#1e293b' }]}>
            Last {timeRange}
          </Text>
          <ChevronDown size={20} color={isDark ? '#fff' : '#1e293b'} />
        </TouchableOpacity>

        {showRangeDropdown && (
          <View style={[styles.timeRangeDropdown, { backgroundColor: isDark ? '#2d3748' : '#fff' }]}>
            {['week', 'month', 'year'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeOption,
                  timeRange === range && styles.timeRangeOptionSelected
                ]}
                onPress={() => {
                  setTimeRange(range);
                  setShowRangeDropdown(false);
                }}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  { color: isDark ? '#fff' : '#1e293b' }
                ]}>
                  Last {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Clock size={24} color="#60a5fa" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>156</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Total Hours
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Plane size={24} color="#34d399" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>45</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Total Flights
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <MapPin size={24} color="#f59e0b" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>28</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Airports Visited
            </Text>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.chartTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Flight Hours Trend
          </Text>
          <LineChart
            data={flightData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={[styles.chartCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.chartTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Aircraft Usage
          </Text>
          <BarChart
            data={aircraftData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={[styles.chartCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.chartTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Flight Types Distribution
          </Text>
          <PieChart
            data={flightTypeData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
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
  },
  title: {
    fontSize: 32,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  timeRangeContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  timeRangeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  timeRangeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  timeRangeOption: {
    padding: 12,
  },
  timeRangeOptionSelected: {
    backgroundColor: 'rgba(96,165,250,0.1)',
  },
  timeRangeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Medium',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
});