// app/(tabs)/new.tsx

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Plane, Calendar, Clock, MapPin, FileText, Fuel, Cloud, Thermometer, Wind } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import { createFlight } from '@/lib/api';

export default function NewFlightScreen() {
  const { isDark } = useTheme();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [flightStarted, setFlightStarted] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [notes, setNotes] = useState('');

  // Flight details
  const [flightName, setFlightName] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [route, setRoute] = useState('');
  const [fuelUsed, setFuelUsed] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('');
  const [temperature, setTemperature] = useState('');
  const [visibility, setVisibility] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [windDirection, setWindDirection] = useState('');

  const handleStartFlight = async () => {
    if (!departureAirport || !flightName || !aircraftType) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter required flight details',
      });
      return;
    }

    const now = new Date();
    setStartTime(format(now, 'HH:mm:ss'));
    setFlightStarted(true);
    
    Toast.show({
      type: 'success',
      text1: 'Flight Started',
      text2: 'Your flight time is now being tracked',
    });
  };

  const handleEndFlight = async () => {
    if (!arrivalAirport) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter arrival airport',
      });
      return;
    }

    const now = new Date();
    const endTimeStr = format(now, 'HH:mm:ss');
    setEndTime(endTimeStr);
    setFlightStarted(false);

    try {
      const startDate = new Date();
      startDate.setHours(...startTime.split(':').map(Number));
      const endDate = new Date();
      endDate.setHours(...endTimeStr.split(':').map(Number));
      
      const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

      const flightData = {
        departure_airport: departureAirport,
        arrival_airport: arrivalAirport,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        total_hours: hours.toFixed(1),
        aircraft_type: aircraftType,
        flight_number: flightNumber,
        route,
        fuel_used: parseFloat(fuelUsed) || 0,
        conditions: selectedConditions,
        notes,
        weather_conditions: {
          temperature: parseFloat(temperature),
          visibility: parseFloat(visibility),
          wind_speed: parseFloat(windSpeed),
          wind_direction: parseFloat(windDirection),
          conditions: weatherConditions
        }
      };

      await createFlight(flightData);
      
      Toast.show({
        type: 'success',
        text1: 'Flight Logged',
        text2: 'Your flight has been added to your logbook',
      });

      router.push('/logbook');
    } catch (error) {
      console.error('Flight submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save flight data',
      });
    }
  };

  const toggleCondition = (condition) => {
    setSelectedConditions(current =>
      current.includes(condition)
        ? current.filter(c => c !== condition)
        : [...current, condition]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Log New Flight</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Record your aviation experience</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Flight Information</Text>
          
          <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <FileText size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Flight Name"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={flightName}
                onChangeText={setFlightName}
                editable={!flightStarted}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Plane size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Aircraft Type"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={aircraftType}
                onChangeText={setAircraftType}
                editable={!flightStarted}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <FileText size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Flight Number"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={flightNumber}
                onChangeText={setFlightNumber}
                editable={!flightStarted}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Fuel size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Fuel Used (gallons)"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={fuelUsed}
                onChangeText={setFuelUsed}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Flight Details</Text>
          
          <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Calendar size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Date"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={new Date().toLocaleDateString()}
                editable={false}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Clock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Start Time"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={startTime}
                editable={false}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Clock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="End Time"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={endTime}
                editable={false}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Clock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Total Hours"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={totalHours ? `${totalHours} hours` : ''}
                editable={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Route</Text>
          
          <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <MapPin size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Departure Airport"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={departureAirport}
                onChangeText={setDepartureAirport}
                editable={!flightStarted}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <MapPin size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Arrival Airport"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={arrivalAirport}
                onChangeText={setArrivalAirport}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <MapPin size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Route Details"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={route}
                onChangeText={setRoute}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Weather Information</Text>
          
          <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Cloud size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Weather Conditions"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={weatherConditions}
                onChangeText={setWeatherConditions}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Thermometer size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Temperature (°F)"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Cloud size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Visibility (miles)"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={visibility}
                onChangeText={setVisibility}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Wind size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Wind Speed (knots)"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={windSpeed}
                onChangeText={setWindSpeed}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Wind size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Wind Direction (degrees)"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={windDirection}
                onChangeText={setWindDirection}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Flight Conditions</Text>
          
          <View style={styles.conditionsGrid}>
            {['Day', 'Night', 'IFR', 'VFR', 'Cross Country', 'Solo'].map((condition) => (
              <TouchableOpacity 
                key={condition} 
                style={[
                  styles.conditionButton,
                  { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' },
                  selectedConditions.includes(condition) && styles.conditionSelected
                ]}
                onPress={() => toggleCondition(condition)}
              >
                <Text 
                  style={[
                    styles.conditionText,
                    { color: isDark ? '#94a3b8' : '#64748b' },
                    selectedConditions.includes(condition) && styles.conditionTextSelected
                  ]}
                >
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Notes</Text>
          <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9', height: 100 }]}>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
              placeholder="Add flight notes..."
              placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        {!flightStarted ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartFlight}>
            <Text style={styles.buttonText}>Start Flight</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.endButton} onPress={handleEndFlight}>
            <Text style={styles.buttonText}>End Flight</Text>
          </TouchableOpacity>
        )}
      </View>
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
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 18,
    marginBottom: 12,
  },
  inputGroup: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  conditionSelected: {
    backgroundColor: '#60a5fa',
  },
  conditionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  conditionTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  startButton: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});