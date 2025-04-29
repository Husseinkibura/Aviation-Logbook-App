import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Calendar, Clock, MapPin, Plus, Bell, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface FlightSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  departure: string;
  arrival: string;
  aircraft: string;
  notes: string;
}

export default function ScheduleScreen() {
  const { isDark } = useTheme();
  const [schedules, setSchedules] = useState<FlightSchedule[]>([
    {
      id: '1',
      title: 'Training Flight',
      date: '2024-03-20',
      time: '09:00',
      departure: 'KJFK',
      arrival: 'KLGA',
      aircraft: 'C172',
      notes: 'Practice approaches'
    },
    {
      id: '2',
      title: 'Cross Country',
      date: '2024-03-22',
      time: '14:30',
      departure: 'KLGA',
      arrival: 'KBOS',
      aircraft: 'PA28',
      notes: 'VFR flight plan'
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<FlightSchedule>>({});

  const scheduleNotification = async (schedule: FlightSchedule) => {
    const trigger = new Date(schedule.date + 'T' + schedule.time);
    trigger.setHours(trigger.getHours() - 2); // 2 hours before flight

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Flight Reminder',
        body: `Your flight ${schedule.title} from ${schedule.departure} to ${schedule.arrival} is in 2 hours`,
      },
      trigger,
    });
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.title || !newSchedule.date || !newSchedule.time) {
      return;
    }

    const schedule = {
      id: Date.now().toString(),
      title: newSchedule.title!,
      date: newSchedule.date!,
      time: newSchedule.time!,
      departure: newSchedule.departure || '',
      arrival: newSchedule.arrival || '',
      aircraft: newSchedule.aircraft || '',
      notes: newSchedule.notes || ''
    };

    setSchedules([...schedules, schedule]);
    await scheduleNotification(schedule);
    setShowForm(false);
    setNewSchedule({});
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Schedule</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Manage your upcoming flights
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {schedules.map((schedule) => (
          <View 
            key={schedule.id} 
            style={[styles.scheduleCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
          >
            <View style={styles.scheduleHeader}>
              <Text style={[styles.scheduleTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
                {schedule.title}
              </Text>
              <Bell size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </View>

            <View style={styles.scheduleDetails}>
              <View style={styles.detailRow}>
                <Calendar size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.detailText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {format(new Date(schedule.date), 'MMM dd, yyyy')} at {schedule.time}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MapPin size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.detailText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {schedule.departure} → {schedule.arrival}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Clock size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.detailText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {schedule.aircraft}
                </Text>
              </View>

              {schedule.notes && (
                <Text style={[styles.notes, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {schedule.notes}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: isDark ? '#60a5fa' : '#3b82f6' }]}
        onPress={() => setShowForm(true)}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.modal, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
                New Flight Schedule
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={24} color={isDark ? '#fff' : '#1e293b'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Title</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
                    color: isDark ? '#fff' : '#1e293b'
                  }]}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={newSchedule.title}
                  onChangeText={(text) => setNewSchedule({ ...newSchedule, title: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Date</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
                    color: isDark ? '#fff' : '#1e293b'
                  }]}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={newSchedule.date}
                  onChangeText={(text) => setNewSchedule({ ...newSchedule, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Time</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
                    color: isDark ? '#fff' : '#1e293b'
                  }]}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={newSchedule.time}
                  onChangeText={(text) => setNewSchedule({ ...newSchedule, time: text })}
                  placeholder="HH:MM"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Departure</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
                    color: isDark ? '#fff' : '#1e293b'
                  }]}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={newSchedule.departure}
                  onChangeText={(text) => setNewSchedule({ ...newSchedule, departure: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Arrival</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
                    color: isDark ? '#fff' : '#1e293b'
                  }]}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={newSchedule.arrival}
                  onChangeText={(text) => setNewSchedule({ ...newSchedule, arrival: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Aircraft</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
                    color: isDark ? '#fff' : '#1e293b'
                  }]}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={newSchedule.aircraft}
                  onChangeText={(text) => setNewSchedule({ ...newSchedule, aircraft: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Notes</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
                    color: isDark ? '#fff' : '#1e293b',
                    height: 100
                  }]}
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={newSchedule.notes}
                  onChangeText={(text) => setNewSchedule({ ...newSchedule, notes: text })}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: isDark ? '#60a5fa' : '#3b82f6' }]}
                onPress={handleAddSchedule}
              >
                <Text style={styles.buttonText}>Schedule Flight</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  scheduleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  scheduleDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  notes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});