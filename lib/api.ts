// lib/api.ts

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

// Flight API functions
export const createFlight = async (flightData: any) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}/flights`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(flightData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create flight');
  return data;
};

export const getFlights = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}/flights`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch flights');
  return data;
};


// Auth functions
export const signIn = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to sign in');
  return data;
};

export const signUp = async (
  email: string,
  password: string,
  username: string,
  name: string,
  confirmPassword: string
) => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, username, name, confirmPassword }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create account');
  return data;
};

// User profile functions
export const getProfile = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data.user;
};

export const updateProfile = async (userData: any) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/auth/update`, { // Matches backend route
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userData.username,
      name: userData.fullName,    // Match backend expectation
      avatar_url: userData.avatarUrl
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data.user; // Return updated user data
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      currentPassword, 
      newPassword 
    }),
  });


  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to change password');
  return data;
};

// Token management
export const storeToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('token');
};


// Add these certification functions at the bottom of the file

export const getCertification = async (id: string): Promise<Certification> => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/certifications/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch certification');
  return data;
};

export const updateCertification = async (id: string, certData: Certification) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/certifications/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(certData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update certification');
  return data;
};

export const deleteCertification = async (id: string) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/certifications/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete certification');
};

// Add these backup functions to your existing lib/api.ts file

// Backup API functions
export const createBackup = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}/backups`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create backup');
  return data;
};

export const getBackups = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}/backups`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch backups');
  return data;
};

export const restoreBackup = async (backupId: string) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}/backups/${backupId}/restore`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to restore backup');
  return data;
};

export const deleteBackup = async (backupId: string) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}/backups/${backupId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete backup');
  }
};