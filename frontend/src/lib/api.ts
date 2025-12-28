import { normalizeIncident } from '../utils/helpers';
import { getMockIncidents } from './mockIncidents';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = {
  // Incidents
  incidents: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/incidents`);
        if (!response.ok) throw new Error('Failed to fetch incidents');
        const data = await response.json();
        // Normalize each incident
        return (Array.isArray(data) ? data : []).map(normalizeIncident);
      } catch (err) {
        // Fallback to mock incidents
        return getMockIncidents();
      }
    },
    getById: async (id: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/incidents/${id}`);
        if (!response.ok) throw new Error('Failed to fetch incident');
        const data = await response.json();
        return normalizeIncident(data);
      } catch (err) {
        // Fallback: find in mock incidents
        const mock = getMockIncidents();
        const found = mock.find((m) => m.id === id);
        if (!found) throw err;
        return found;
      }
    },
    create: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create incident');
      const responseData = await response.json();
      return normalizeIncident(responseData);
    },
    update: async (id: string, data: any) => {
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update incident');
      const responseData = await response.json();
      return normalizeIncident(responseData);
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete incident');
      return response.json();
    },
  },

  // Auth
  auth: {
    register: async (email: string, password: string, name: string, role: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    },
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
  },

  // Admin
  admin: {
    getUsers: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    updateUserRole: async (userId: string, role: string) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update user role');
      return response.json();
    },
    deleteUser: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
  },
};
