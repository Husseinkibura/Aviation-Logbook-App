import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Plane, Calendar, Clock, MapPin, FileText, Download, Save } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import { createFlight } from '@/lib/api';
import FlightService from '@/services/flightService';

export default function NewFlightScreen() {
  const { isDark } = useTheme();
  const [mode, setMode] = useState('automatic');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [flightStarted, setFlightStarted] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [flightName, setFlightName] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [route, setRoute] = useState('');
  const [flightDate, setFlightDate] = useState(new Date().toISOString().split('T')[0]);

  const [autoFillData, setAutoFillData] = useState({
    flightNumber: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchFlightData = async () => {
    if (!autoFillData.flightNumber || !autoFillData.date) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter flight number and date',
      });
      return;
    }

    // Check for future date
    const today = new Date();
    if (new Date(autoFillData.date) > today) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Date',
        text2: 'Cannot search for future flights',
      });
      return;
    }

    setLoading(true);
    try {
      const flightData = await FlightService.fetchFlightData(
        autoFillData.flightNumber,
        autoFillData.date
      );

       if (flightData) {
        // Set all fields from fetched data
        setDepartureAirport(flightData.departure);
        setArrivalAirport(flightData.arrival);
        setAircraftType(flightData.aircraftType);
        setStartTime(flightData.departureTime);
        setEndTime(flightData.arrivalTime);
        setTotalHours(flightData.totalTime.toString());
        setFlightNumber(flightData.flightNumber); // Add this line
        setFlightDate(flightData.date); // Add this line

        const formattedDate = new Date(flightData.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        
        // Create flight name using fetched data
        setFlightName(`${flightData.departure}-${flightData.arrival} ${formattedDate}`);

        Toast.show({
          type: 'success',
          text1: 'Flight Data Loaded',
          text2: 'Flight details have been auto-filled',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Flight Not Found',
          text2: 'No flight data available for this number and date',
        });
      }
    } catch (error) {
      console.error('Flight data fetch error:', error);
      
      let errorMessage = 'Failed to fetch flight data';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('API rate limit')) {
        errorMessage = 'API limit reached. Try again later.';
      } else if (errorMessage.includes('Invalid date format')) {
        errorMessage = 'Please use YYYY-MM-DD format for date';
      } else if (errorMessage.includes('Unexpected API response format')) {
        errorMessage = 'The flight data service returned an unexpected format. Please try manual entry.';
      } else if (errorMessage.includes('Flight data incomplete')) {
        errorMessage = 'Incomplete flight data received. Some fields may be missing.';
      } else if (errorMessage.includes('API error')) {
        errorMessage = 'Flight data service error. Please check your inputs.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'API Error',
        text2: errorMessage,
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

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
        conditions: selectedConditions,
        notes,
        flight_date: flightDate,
        flight_name: flightName,
      };

      await createFlight(flightData);
      
      Toast.show({
        type: 'success',
        text1: 'Flight Logged',
        text2: 'Your flight has been added to your logbook',
      });

      router.push('/(tabs)/logbook');
    } catch (error) {
      let errorMessage = 'Failed to save flight data';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Flight submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  const handleSaveManual = async () => {
    if (!departureAirport || !arrivalAirport || !startTime || !endTime || !totalHours) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill all required fields',
      });
      return;
    }

    try {
      // Combine date with time
      const startDateTime = new Date(`${flightDate}T${startTime}`);
      const endDateTime = new Date(`${flightDate}T${endTime}`);

      const flightData = {
        departure_airport: departureAirport,
        arrival_airport: arrivalAirport,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        total_hours: parseFloat(totalHours),
        aircraft_type: aircraftType,
        flight_number: flightNumber,
        route,
        conditions: selectedConditions,
        notes,
        flight_date: flightDate,
        flight_name: flightName,
      };

      await createFlight(flightData);
      
      Toast.show({
        type: 'success',
        text1: 'Flight Saved',
        text2: 'Your manual flight has been logged',
      });

      router.push('/(tabs)/logbook');
    } catch (error) {
      let errorMessage = 'Failed to save flight data';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Flight submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  const toggleCondition = (condition: string) => {
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
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'automatic' && styles.activeModeButton,
              { backgroundColor: isDark ? '#1e293b' : '#fff' }
            ]}
            onPress={() => setMode('automatic')}
          >
            <Text style={[styles.modeText, mode === 'automatic' && styles.activeModeText]}>
              Automatic
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'manual' && styles.activeModeButton,
              { backgroundColor: isDark ? '#1e293b' : '#fff' }
            ]}
            onPress={() => setMode('manual')}
          >
            <Text style={[styles.modeText, mode === 'manual' && styles.activeModeText]}>
              Manual
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auto-fill Section */}
        {mode === 'automatic' && (
          <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={[styles.sectionHeader, { marginBottom: 16 }]}>
              <Plane size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
                Auto-fill Flight Data
              </Text>
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Flight Number
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                    placeholder="e.g., UA2402"
                    placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                    value={autoFillData.flightNumber}
                    onChangeText={(text) => setAutoFillData({...autoFillData, flightNumber: text.toUpperCase()})}
                    editable={!flightStarted}
                  />
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Date
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                    value={autoFillData.date}
                    onChangeText={(text) => setAutoFillData({...autoFillData, date: text})}
                    editable={!flightStarted}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.autoFillButton, { 
                backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                opacity: loading || flightStarted ? 0.6 : 1
              }]}
              onPress={fetchFlightData}
              disabled={loading || flightStarted}
            >
              <Download size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {loading ? 'Searching...' : 'Find Flight Data'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Flight Information
          </Text>
          
          <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Flight Name
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
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
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Aircraft Type
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
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
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Flight Number
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
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
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Flight Details
          </Text>
          
          <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Date
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                <Calendar size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={flightDate}
                  onChangeText={setFlightDate}
                  editable={mode === 'manual' && !flightStarted}
                />
              </View>
            </View>

            {/* Start Time */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Start Time
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                <Clock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                  placeholder="HH:MM"
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={startTime}
                  onChangeText={setStartTime}
                  editable={mode === 'manual' || !flightStarted}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {/* End Time */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                End Time
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                <Clock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                  placeholder="HH:MM"
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={endTime}
                  onChangeText={setEndTime}
                  editable={mode === 'manual' || !flightStarted}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {/* Total Hours */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Total Hours
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                <Clock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                  placeholder="Total Hours"
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={totalHours}
                  onChangeText={setTotalHours}
                  editable={mode === 'manual'}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Route
          </Text>
          
          <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Departure Airport
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
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
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Arrival Airport
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                <MapPin size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                  placeholder="Arrival Airport"
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={arrivalAirport}
                  onChangeText={setArrivalAirport}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Route Details
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Flight Conditions
          </Text>
          
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
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
            Notes
          </Text>
          <View style={[styles.inputWrapper, { 
            backgroundColor: isDark ? '#2d3748' : '#f1f5f9', 
            height: 100 
          }]}>
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
        {mode === 'automatic' ? (
          !flightStarted ? (
            <TouchableOpacity 
              style={[styles.startButton, (loading || flightStarted) && styles.disabledButton]} 
              onPress={handleStartFlight}
              disabled={loading || flightStarted}
            >
              <Text style={styles.buttonText}>Start Flight</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.endButton} onPress={handleEndFlight}>
              <Text style={styles.buttonText}>End Flight</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSaveManual}
            disabled={loading}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Save Flight</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 18,
  },
  inputGroup: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  endButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  autoFillButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeModeButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  modeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
  },
  activeModeText: {
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
});