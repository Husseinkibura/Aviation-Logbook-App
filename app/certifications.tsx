// app/(tabs)/certifications.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Award, Clock, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getCertifications, createCertification, updateCertification, deleteCertification } from '@/lib/api';

interface Certification {
  id: number;
  user_id: number;
  name: string;
  type: string;
  issue_date: string | null;
  expiry_date: string | null;
  status: 'active' | 'expired' | 'pending';
  requirements: {
    total: number;
    completed: number;
    items: Array<{
      id: number;
      name: string;
      completed: boolean;
      hours?: number;
      required_hours?: number;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export default function CertificationsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCert, setSelectedCert] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCertifications = async () => {
    try {
      const data = await getCertifications();
      setCertifications(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch certifications');
      console.error('Certification fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchCertifications();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCertifications();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'expired': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not issued';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statusCounts = certifications.reduce((acc, cert) => {
    acc[cert.status] = (acc[cert.status] || 0) + 1;
    return acc;
  }, { active: 0, expired: 0, pending: 0 });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <Text style={{ color: isDark ? '#fff' : '#1e293b' }}>Loading certifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <Text style={{ color: isDark ? '#fff' : '#1e293b' }}>{error}</Text>
        <TouchableOpacity onPress={fetchCertifications} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Certifications</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Track your aviation qualifications
        </Text>
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
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Award size={24} color="#22c55e" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {statusCounts.active}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Clock size={24} color="#f59e0b" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {statusCounts.pending}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <AlertCircle size={24} color="#ef4444" />
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
              {statusCounts.expired}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Expired</Text>
          </View>
        </View>

        <View style={styles.certifications}>
          {certifications.map((cert) => (
            <View key={cert.id}>
              <TouchableOpacity
                style={[
                  styles.certCard,
                  { backgroundColor: isDark ? '#1e293b' : '#fff' },
                  selectedCert === cert.id && { borderColor: '#60a5fa', borderWidth: 2 }
                ]}
                onPress={() => setSelectedCert(cert.id === selectedCert ? null : cert.id)}
              >
                <View style={styles.certHeader}>
                  <View style={styles.certInfo}>
                    <Text style={[styles.certName, { color: isDark ? '#fff' : '#1e293b' }]}>
                      {cert.name}
                    </Text>
                    <View style={[styles.certType, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                      <Text style={[styles.certTypeText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                        {cert.type}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.certStatus, { backgroundColor: `${getStatusColor(cert.status)}20` }]}>
                    <Text style={[styles.certStatusText, { color: getStatusColor(cert.status) }]}>
                      {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.certDates}>
                  <Text style={[styles.dateLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    Issue Date: {formatDate(cert.issue_date)}
                  </Text>
                  {cert.expiry_date && (
                    <Text style={[styles.dateLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Expires: {formatDate(cert.expiry_date)}
                    </Text>
                  )}
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Requirements
                    </Text>
                    <Text style={[styles.progressText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      {cert.requirements.completed}/{cert.requirements.total}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(cert.requirements.completed / cert.requirements.total) * 100}%`,
                          backgroundColor: getStatusColor(cert.status)
                        }
                      ]}
                    />
                  </View>
                </View>

                {selectedCert === cert.id && (
                  <View style={styles.requirements}>
                    {cert.requirements.items.map((item) => (
                      <View key={item.id} style={styles.requirementItem}>
                        <View style={styles.requirementHeader}>
                          <CheckCircle2
                            size={20}
                            color={item.completed ? '#22c55e' : isDark ? '#4b5563' : '#94a3b8'}
                          />
                          <Text style={[styles.requirementText, { color: isDark ? '#fff' : '#1e293b' }]}>
                            {item.name}
                          </Text>
                        </View>
                        {item.hours !== undefined && (
                          <Text style={[styles.hoursText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                            {item.hours}/{item.required_hours} hours
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                <ChevronRight
                  size={20}
                  color={isDark ? '#94a3b8' : '#64748b'}
                  style={[
                    styles.chevron,
                    selectedCert === cert.id && styles.chevronRotated
                  ]}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Keep the same StyleSheet as before
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
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  certifications: {
    gap: 16,
  },
  certCard: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  certInfo: {
    flex: 1,
    gap: 8,
  },
  certName: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  certType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  certTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  certStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  certStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  certDates: {
    gap: 4,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  requirements: {
    gap: 12,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  requirementItem: {
    gap: 4,
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  hoursText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 28,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  retryButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#60a5fa',
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
});