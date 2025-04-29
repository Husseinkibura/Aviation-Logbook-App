// app/certifications/[id].tsx

import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Award, Calendar, FileText, Clock, User, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { TouchableOpacity } from 'react-native-gesture-handler';

const certificationDetails = {
  id: '1',
  name: 'Open Water Diver',
  date: '2023-03-15',
  agency: 'PADI',
  depth: '18 meters',
  instructor: 'John DiveMaster',
  dives: 5,
  status: 'Active',
};

export default function CertificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <TouchableOpacity onPress={() => window.history.back()}>
          <ChevronLeft size={24} color={isDark ? '#fff' : '#1e293b'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>{certificationDetails.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <View style={styles.infoItem}>
            <Award size={20} color={isDark ? '#60a5fa' : '#2563eb'} />
            <Text style={[styles.infoText, { color: isDark ? '#fff' : '#1e293b' }]}>{certificationDetails.agency}</Text>
          </View>
          <View style={styles.infoItem}>
            <Calendar size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.infoText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Issued: {certificationDetails.date}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <User size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.infoText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Instructor: {certificationDetails.instructor}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Requirements</Text>
          <View style={styles.requirementItem}>
            <Text style={[styles.requirementText, { color: isDark ? '#fff' : '#1e293b' }]}>
              • Minimum 5 logged dives
            </Text>
            <Text style={[styles.requirementStatus, { color: '#22c55e' }]}>Completed</Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={[styles.requirementText, { color: isDark ? '#fff' : '#1e293b' }]}>
              • Depth limit: {certificationDetails.depth}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 60,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 18,
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requirementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
  },
  requirementStatus: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});