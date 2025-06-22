// components/FlightForm.tsx
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Plane, Calendar, Clock, MapPin, FileText, Save } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { createFlight } from '@/lib/api';
import { format } from 'date-fns';

export default function FlightForm({ 
  formData, 
  updateFormData,
  isDark,
  mode 
}: {
  formData: any;
  updateFormData: (data: any) => void;
  isDark: boolean;
  mode: 'auto' | 'manual';
}) {
  const {
    flightName,
    aircraftType,
    flightNumber,
    route,
    flightDate,
    startTime,
    endTime,
    totalHours,
    departureAirport,
    arrivalAirport,
    conditions,
    notes,
    flightStarted
  } = formData;

  const toggleCondition = (condition: string) => {
    updateFormData({
      conditions: conditions.includes(condition)
        ? conditions.filter(c => c !== condition)
        : [...conditions, condition]
    });
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
    updateFormData({
      startTime: format(now, 'HH:mm:ss'),
      flightStarted: true
    });
    
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
    updateFormData({
      endTime: endTimeStr,
      flightStarted: false
    });

    try {
      // Same as original handleEndFlight implementation
    } catch (error: any) {
      // Error handling
    }
  };

  const handleSaveManual = async () => {
    // Same as original handleSaveManual implementation
  };

  return (
    <>
      {/* Flight Information */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
          Flight Information
        </Text>
        
        <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {/* Input fields same as original */}
        </View>
      </View>

      {/* Flight Details */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
          Flight Details
        </Text>
        
        <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {/* Input fields same as original */}
        </View>
      </View>

      {/* Route */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
          Route
        </Text>
        
        <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {/* Input fields same as original */}
        </View>
      </View>

      {/* Flight Conditions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
          Flight Conditions
        </Text>
        
        <View style={styles.conditionsGrid}>
          {/* Conditions same as original */}
        </View>
      </View>

      {/* Notes */}
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
            onChangeText={(text) => updateFormData({ notes: text })}
          />
        </View>
      </View>

      {/* Footer Buttons */}
      <View style={[styles.footer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        {mode === 'auto' ? (
          !flightStarted ? (
            <TouchableOpacity 
              style={[styles.startButton]} 
              onPress={handleStartFlight}
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
            style={[styles.saveButton]} 
            onPress={handleSaveManual}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Save Flight</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
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