export type UserRole = 'citizen' | 'responder' | 'admin';

export type IncidentType = 'fire' | 'medical' | 'accident' | 'security' | 'natural_disaster';

export type IncidentStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AssignmentType = 'Police' | 'Fire' | 'Medical' | 'Multiple';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy properties for compatibility
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  created_at?: string;
  updated_at?: string;
  verification_score?: number;
  verified_by?: string;
  responder_notes?: string;
}

export interface IncidentConfirmation {
  id: string;
  incident_id: string;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface IncidentWithDistance extends Incident {
  distance?: number;
}

export interface CreateIncidentPayload {
  type: IncidentType;
  description: string;
  location_lat: number;
  location_lng: number;
  location_address?: string;
  severity: IncidentSeverity;
  reporter_id?: string;
}

export interface UpdateIncidentPayload {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  verified_by?: string;
  assigned_to?: AssignmentType;
  responder_notes?: string;
}
