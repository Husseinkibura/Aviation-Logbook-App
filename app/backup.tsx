// app/backup.tsx

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Download, Upload, FileJson, Trash2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Toast from 'react-native-toast-message';
import { 
  createBackup, 
  getBackups, 
  restoreBackup, 
  deleteBackup 
} from '@/lib/api';

type BackupStatus = 'idle' | 'loading';

interface BackupItem {
  id: string;
  date: string;
  size: string;
  type: 'auto' | 'manual';
}

export default function BackupScreen() {
  const { isDark } = useTheme();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>('idle');

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const data = await getBackups();
      setBackups(data.map((b: any) => ({
        id: b.id,
        date: new Date(b.created_at).toLocaleString(), // Changed from b.date to b.created_at
        size: b.size,
        type: b.type
      })));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load backups',
      });
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackupStatus('loading');
      const newBackup = await createBackup();
      
      setBackups(prev => [{
        id: newBackup.id,
        date: new Date(newBackup.created_at).toLocaleString(), // Changed from newBackup.date
        size: newBackup.size,
        type: newBackup.type
      }, ...prev]);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Backup created successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create backup',
      });
    } finally {
      setBackupStatus('idle');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      setBackupStatus('loading');
      await restoreBackup(backupId);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Backup restored successfully',
      });
      
      // Refresh data after restore
      loadBackups();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to restore backup',
      });
    } finally {
      setBackupStatus('idle');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      setBackupStatus('loading');
      await deleteBackup(backupId);
      
      setBackups(prev => prev.filter(b => b.id !== backupId));
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Backup deleted successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to delete backup',
      });
    } finally {
      setBackupStatus('idle');
    }
  };

  if (loadingBackups) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Calculate dynamic stats
  const totalBackups = backups.length;
  const totalSize = backups.reduce((sum, b) => sum + parseFloat(b.size), 0).toFixed(1) + ' MB';


  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Backup</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Manage your flight data backups
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <FileJson size={20} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
                Backup Options
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.createButton,
                backupStatus === 'loading' && styles.createButtonDisabled,
              ]}
              onPress={handleCreateBackup}
              disabled={backupStatus === 'loading'}
            >
              {backupStatus === 'loading' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Download size={20} color="#fff" />
                  <Text style={styles.createButtonText}>Create Backup</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
            {totalBackups}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Total Backups
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>
            {totalSize}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Total Size
          </Text>
        </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#1e293b' }]}>Daily</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Auto Backup
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <FileJson size={20} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
                Backup History
              </Text>
            </View>
          </View>

          {backups.map((backup) => (
            <View
              key={backup.id}
              style={[
                styles.backupItem,
                { borderBottomColor: isDark ? '#2d3748' : '#e2e8f0' },
              ]}
            >
              <View style={styles.backupInfo}>
                <View style={styles.backupHeader}>
                  <Text style={[styles.backupDate, { color: isDark ? '#fff' : '#1e293b' }]}>
                    {backup.date}
                  </Text>
                  <View
                    style={[
                      styles.backupType,
                      {
                        backgroundColor: backup.type === 'auto' ? '#22c55e20' : '#60a5fa20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.backupTypeText,
                        {
                          color: backup.type === 'auto' ? '#22c55e' : '#60a5fa',
                        },
                      ]}
                    >
                      {backup.type === 'auto' ? 'Auto' : 'Manual'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.backupSize, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Size: {backup.size}
                </Text>
              </View>

              <View style={styles.backupActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}
                  onPress={() => handleRestoreBackup(backup.id)}
                >
                  <Upload size={20} color={isDark ? '#fff' : '#1e293b'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}
                  onPress={() => handleDeleteBackup(backup.id)}
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <AlertCircle size={20} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>
                Backup Information
              </Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <CheckCircle2 size={20} color="#22c55e" />
              <Text style={[styles.infoText, { color: isDark ? '#fff' : '#1e293b' }]}>
                Flight logs and details
              </Text>
            </View>
            <View style={styles.infoItem}>
              <CheckCircle2 size={20} color="#22c55e" />
              <Text style={[styles.infoText, { color: isDark ? '#fff' : '#1e293b' }]}>
                Certifications and ratings
              </Text>
            </View>
            <View style={styles.infoItem}>
              <CheckCircle2 size={20} color="#22c55e" />
              <Text style={[styles.infoText, { color: isDark ? '#fff' : '#1e293b' }]}>
                Personal settings and preferences
              </Text>
            </View>
            <View style={styles.infoItem}>
              <CheckCircle2 size={20} color="#22c55e" />
              <Text style={[styles.infoText, { color: isDark ? '#fff' : '#1e293b' }]}>
                Statistics and analytics data
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
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
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  createButton: {
    backgroundColor: '#60a5fa',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backupInfo: {
    flex: 1,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  backupDate: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  backupType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  backupTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  backupSize: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});