import { useEffect, useRef } from 'react';
import { Incident } from '../types';
import { getSeverityColor } from '../utils/helpers';

interface GoogleMapProps {
  incidents: Incident[];
  selectedIncident?: Incident;
  onIncidentClick?: (incident: Incident) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function GoogleMap({
  incidents,
  selectedIncident,
  onIncidentClick,
  userLocation,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const defaultCenter = userLocation || { lat: 28.6139, lng: 77.2090 }; // Default to New Delhi

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: defaultCenter,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
    });

    mapInstanceRef.current = map;

    // Add user location marker if available
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 100,
      });
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add incident markers
    incidents.forEach((incident) => {
      const lat = incident.location_lat || 0;
      const lng = incident.location_lng || 0;
      const severity = incident.severity || 'low';

      const severityColor = getSeverityColor(severity);
      const colorMap: Record<string, string> = {
        red: '#EF4444',
        orange: '#F97316',
        yellow: '#EAB308',
        gray: '#6B7280',
      };

      const color = colorMap[severityColor] || '#6B7280';

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: incident.title || incident.type,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: selectedIncident?.id === incident.id ? 50 : 1,
      });

      // Add click listener
      marker.addListener('click', () => {
        onIncidentClick?.(incident);
        // Center map on clicked incident
        map.setCenter({ lat, lng });
        map.setZoom(15);
      });

      // Show info window on click
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 w-48">
            <h3 class="font-bold text-gray-900 capitalize">${incident.type}</h3>
            <p class="text-sm text-gray-600 mt-1">${incident.description}</p>
            <div class="mt-2 flex gap-2">
              <span class="text-xs px-2 py-1 rounded-full font-semibold" style="background-color: ${color}20; color: ${color}">
                ${severity}
              </span>
              <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                ${incident.status}
              </span>
            </div>
            ${incident.location_address ? `<p class="text-xs text-gray-500 mt-2">📍 ${incident.location_address}</p>` : ''}
          </div>
        `,
        disableAutoPan: false,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if incidents exist
    if (incidents.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      if (userLocation) bounds.extend(userLocation);
      incidents.forEach((incident) => {
        bounds.extend({
          lat: incident.location_lat || 0,
          lng: incident.location_lng || 0,
        });
      });
      map.fitBounds(bounds);
    }
  }, [incidents, selectedIncident, userLocation, onIncidentClick]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
  );
}
