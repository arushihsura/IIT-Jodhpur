import { IncidentSeverity, IncidentStatus, Incident } from '../types';

export function formatTimeAgo(date: string | undefined): string {
  if (!date) return 'Unknown';
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function normalizeIncident(incident: any): Incident {
  // Convert backend data to frontend format
  const [lng, lat] = incident.location?.coordinates || [0, 0];
  
  return {
    id: incident._id || incident.id,
    title: incident.title || incident.type,
    type: incident.type,
    description: incident.description,
    location: incident.location || { type: 'Point', coordinates: [lng, lat] },
    severity: incident.severity,
    status: incident.status,
    reportedBy: incident.reportedBy,
    assignedTo: incident.assignedTo,
    imageUrl: incident.imageUrl,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
    // Compatibility properties
    location_lat: lat,
    location_lng: lng,
    location_address: incident.address,
    created_at: incident.createdAt,
    updated_at: incident.updatedAt,
    verification_score: incident.verificationScore || 0,
  };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)}km away`;
}

export function getSeverityColor(severity: IncidentSeverity | string): 'red' | 'orange' | 'yellow' | 'gray' {
  const colors: Record<string, 'red' | 'orange' | 'yellow' | 'gray'> = {
    critical: 'red',
    CRITICAL: 'red',
    high: 'orange',
    HIGH: 'orange',
    medium: 'yellow',
    MEDIUM: 'yellow',
    low: 'gray',
    LOW: 'gray',
  };
  return colors[severity] || 'gray';
}

export function getStatusColor(status: IncidentStatus | string): 'gray' | 'blue' | 'yellow' | 'green' | 'red' {
  const colors: Record<string, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
    reported: 'gray',
    UNVERIFIED: 'gray',
    assigned: 'blue',
    VERIFIED: 'blue',
    in_progress: 'yellow',
    IN_PROGRESS: 'yellow',
    resolved: 'green',
    RESOLVED: 'green',
    false_report: 'red',
    FALSE_REPORT: 'red',
  };
  return colors[status] || 'gray';
}

export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}
