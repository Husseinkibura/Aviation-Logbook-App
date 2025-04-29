import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, AlertCircle, CheckCircle, Filter, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'flight' | 'schedule' | 'profile';
  entityId: string;
  details: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export default function AuditScreen() {
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const auditLogs: AuditLog[] = [
    {
      id: '1',
      action: 'create',
      entityType: 'flight',
      entityId: 'flight-123',
      details: 'Created new flight log: KJFK to KLAX',
      timestamp: '2024-03-15T14:30:00Z',
      userId: 'user-1',
      userName: 'John Doe'
    },
    {
      id: '2',
      action: 'update',
      entityType: 'profile',
      entityId: 'user-1',
      details: 'Updated pilot certifications',
      timestamp: '2024-03-14T10:15:00Z',
      userId: 'user-1',
      userName: 'John Doe'
    },
    {
      id: '3',
      action: 'delete',
      entityType: 'schedule',
      entityId: 'schedule-456',
      details: 'Deleted scheduled flight: Training Session',
      timestamp: '2024-03-13T09:00:00Z',
      userId: 'user-1',
      userName: 'John Doe'
    }
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return '#22c55e';
      case 'update':
        return '#3b82f6';
      case 'delete':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <CheckCircle size={20} color="#22c55e" />;
      case 'update':
        return <Clock size={20} color="#3b82f6" />;
      case 'delete':
        return <AlertCircle size={20} color="#ef4444" />;
      default:
        return null;
    }
  };

  const filteredLogs = selectedFilter === 'all'
    ? auditLogs
    : auditLogs.filter(log => log.action === selectedFilter);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Audit History</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Track all system activities
        </Text>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={isDark ? '#fff' : '#1e293b'} />
          <Text style={[styles.filterText, { color: isDark ? '#fff' : '#1e293b' }]}>
            {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
          </Text>
          <ChevronDown size={20} color={isDark ? '#fff' : '#1e293b'} />
        </TouchableOpacity>

        {showFilters && (
          <View style={[styles.filterDropdown, { backgroundColor: isDark ? '#2d3748' : '#fff' }]}>
            {['all', 'create', 'update', 'delete'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  selectedFilter === filter && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setSelectedFilter(filter);
                  setShowFilters(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: isDark ? '#fff' : '#1e293b' }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {filteredLogs.map((log) => (
          <View
            key={log.id}
            style={[
              styles.logItem,
              { backgroundColor: isDark ? '#1e293b' : '#fff' }
            ]}
          >
            <View style={styles.logHeader}>
              {getActionIcon(log.action)}
              <Text style={[styles.logAction, { color: getActionColor(log.action) }]}>
                {log.action.toUpperCase()}
              </Text>
              <Text style={[styles.logTime, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>

            <Text style={[styles.logDetails, { color: isDark ? '#fff' : '#1e293b' }]}>
              {log.details}
            </Text>

            <View style={styles.logFooter}>
              <Text style={[styles.logUser, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                By {log.userName}
              </Text>
              <Text style={[styles.logType, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1)}
              </Text>
            </View>
          </View>
        ))}
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
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  filterText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  filterDropdown: {
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
  filterOption: {
    padding: 12,
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(96,165,250,0.1)',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logAction: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  logTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 'auto',
  },
  logDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logUser: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  logType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});