import { MapPin, Navigation } from 'lucide-react';
import { Incident } from '../types';
import { getIncidentTypeColor } from './IncidentTypeIcon';
import { getSeverityColor } from '../utils/helpers';

interface SimpleMapProps {
  incidents: Incident[];
  selectedIncident?: Incident;
  onIncidentClick?: (incident: Incident) => void;
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
}

export function SimpleMap({
  incidents,
  selectedIncident,
  onIncidentClick,
  center,
  userLocation,
}: SimpleMapProps) {
  // Calculate bounds to fit all incidents
  const getBounds = () => {
    if (incidents.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    
    incidents.forEach(incident => {
      const lat = incident.location_lat || 0;
      const lng = incident.location_lng || 0;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
    
    return { minLat, maxLat, minLng, maxLng };
  };

  const bounds = getBounds();
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / lngRange) * 90 + 5;
    const y = ((bounds.maxLat - lat) / latRange) * 90 + 5;
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-green-50 rounded-lg relative overflow-hidden border border-gray-200 shadow-inner">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-gray-300"></div>
          ))}
        </div>
      </div>

      {/* User location marker */}
      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={getPosition(userLocation.lat, userLocation.lng)}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75 w-6 h-6"></div>
            <Navigation className="w-6 h-6 text-blue-600 relative" fill="currentColor" />
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              You
            </span>
          </div>
        </div>
      )}

      {/* Incident markers */}
      {incidents.map((incident) => {
        const lat = incident.location_lat || 0;
        const lng = incident.location_lng || 0;
        const position = getPosition(lat, lng);
        const isSelected = selectedIncident?.id === incident.id;
        const severityColor = getSeverityColor(incident.severity);
        
        const colorMap: Record<string, string> = {
          red: 'bg-red-500',
          orange: 'bg-orange-500',
          yellow: 'bg-yellow-500',
          gray: 'bg-gray-500',
        };

        return (
          <div
            key={incident.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 hover:z-30"
            style={{ left: position.x, top: position.y }}
            onClick={() => onIncidentClick?.(incident)}
          >
            <div className={`relative group ${isSelected ? 'scale-150' : 'hover:scale-125'}`}>
              <div
                className={`w-4 h-4 ${colorMap[severityColor]} rounded-full border-2 border-white shadow-lg ${
                  isSelected ? 'ring-4 ring-blue-400 animate-pulse' : ''
                }`}
              ></div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  {incident.title || incident.type}
                  <div className="text-gray-300 capitalize">{incident.severity}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Severity</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Low</span>
          </div>
        </div>
      </div>

      {/* Info badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {incidents.length} Incident{incidents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
