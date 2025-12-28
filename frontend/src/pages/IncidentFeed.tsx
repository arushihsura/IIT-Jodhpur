import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, MapIcon, List, AlertCircle, Zap, X, Sliders, Navigation } from 'lucide-react';
import { api } from '../lib/api';
import { getMockIncidents } from '../lib/mockIncidents';
import { useToast } from '../context/ToastContext';
import { Incident, IncidentType } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { calculateDistance, getUserLocation } from '../utils/helpers';

// Simple OpenStreetMap component without external dependencies
function SimpleOSMap({ 
  incidents, 
  userLocation, 
  selectedIncident,
  onIncidentClick 
}: { 
  incidents: Incident[]; 
  userLocation: { lat: number; lng: number } | null;
  selectedIncident: Incident | null;
  onIncidentClick: (incident: Incident) => void;
}) {
  const mapRef = useRef<HTMLIFrameElement>(null);
  
  const center = userLocation 
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : { lat: 20.5937, lng: 78.9629 }; // India center

  // Create markers string for URL
  const markers = incidents.map((inc, idx) => {
    const color = inc.severity === 'critical' ? 'red' 
      : inc.severity === 'high' ? 'orange'
      : inc.severity === 'medium' ? 'yellow'
      : 'green';
    return `pin-l-${idx + 1}+${color}(${inc.location_lng},${inc.location_lat})`;
  }).join(',');

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers}/${center.lng},${center.lat},12,0/800x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden">
      {/* Embedded OpenStreetMap */}
      <iframe
        ref={mapRef}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05},${center.lat - 0.05},${center.lng + 0.05},${center.lat + 0.05}&layer=mapnik&marker=${center.lat},${center.lng}`}
        className="w-full h-full border-0"
        title="Incident Map"
      />
      
      {/* Overlay with incident markers */}
      <div className="absolute inset-0 pointer-events-none">
        {incidents.map((incident, idx) => {
          const severity = incident.severity === 'critical' ? 'bg-red-500' 
            : incident.severity === 'high' ? 'bg-orange-500'
            : incident.severity === 'medium' ? 'bg-yellow-500'
            : 'bg-green-500';
          
          return (
            <div
              key={incident.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${(incident.location_lng - center.lng) * 1000}px, ${(center.lat - incident.location_lat) * 1000}px)`,
              }}
            >
              <div 
                className={`${severity} w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer pointer-events-auto hover:scale-125 transition-transform ${
                  selectedIncident?.id === incident.id ? 'ring-4 ring-blue-400' : ''
                }`}
                onClick={() => onIncidentClick(incident)}
                title={incident.type}
              />
            </div>
          );
        })}
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
      </div>
    </div>
  );
}

export function IncidentFeed() {
  const navigate = useNavigate();
  const { showInfo } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const previousCountRef = useRef(0);

  const [filters, setFilters] = useState({
    type: 'all',
    verifiedOnly: false,
    timeRange: 'all',
    radiusKm: 'all',
  });

  useEffect(() => {
    fetchIncidents();
    getUserLocation()
      .then(setUserLocation)
      .catch(() => console.log('Could not get user location'));

    const pollInterval = setInterval(() => {
      fetchIncidents(true);
    }, 5000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, filters, userLocation]);

  const fetchIncidents = async (silent = false) => {
    try {
      const data = await api.incidents.getAll();
      
      if (!silent && previousCountRef.current > 0 && data.length > previousCountRef.current) {
        const newCount = data.length - previousCountRef.current;
        showInfo(`${newCount} new incident${newCount > 1 ? 's' : ''} reported`);
      }
      
      previousCountRef.current = data.length;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      // Fallback to mock incidents when API is unavailable
      const mock = getMockIncidents();
      previousCountRef.current = mock.length;
      setIncidents(mock);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    if (filters.type !== 'all') {
      filtered = filtered.filter((inc) => inc.type === filters.type);
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter(
        (inc) => inc.status === 'assigned' || (inc.verification_score || 0) > 2
      );
    }

    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeLimit = new Date(
        now.getTime() - parseInt(filters.timeRange) * 60 * 60 * 1000
      );
      filtered = filtered.filter((inc) => new Date(inc.createdAt || inc.created_at || '') > timeLimit);
    }

    if (filters.radiusKm !== 'all' && userLocation) {
      const radiusKm = parseInt(filters.radiusKm);
      filtered = filtered.filter((inc) => {
        const distance = getIncidentDistance(inc);
        return distance !== undefined && distance <= radiusKm;
      });
    }

    setFilteredIncidents(filtered);
  };

  const getIncidentDistance = (incident: Incident) => {
    if (!userLocation) return undefined;
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      incident.location_lat,
      incident.location_lng
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white sticky top-16 z-30 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <AlertCircle className="w-8 h-8" />
                Live Incident Feed
              </h1>
              <p className="text-blue-100 mt-1">
                {filteredIncidents.length} active incident{filteredIncidents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Sliders className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMap(!showMap)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                {showMap ? <List className="w-4 h-4 mr-2" /> : <MapIcon className="w-4 h-4 mr-2" />}
                {showMap ? 'List' : 'Map'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <Zap className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading incidents...</p>
            </div>
          </div>
        ) : showMap ? (
          <div className="grid lg:grid-cols-5 gap-4 h-full min-h-0">
            {/* Sidebar with Filters and Incidents */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
              {/* Filters Panel */}
              {showFilters && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 animate-in slide-in-from-left duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Incident Type</label>
                      <Select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="text-sm w-full"
                      >
                        <option value="all">All Types</option>
                        <option value="accident">🚗 Accident</option>
                        <option value="fire">🔥 Fire</option>
                        <option value="security">🚨 Security</option>
                        <option value="medical">⚕️ Medical</option>
                        <option value="natural_disaster">🌊 Disaster</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Time Range</label>
                      <Select
                        value={filters.timeRange}
                        onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                        className="text-sm w-full"
                      >
                        <option value="all">All Time</option>
                        <option value="1">Last Hour</option>
                        <option value="6">Last 6 Hours</option>
                        <option value="24">Last 24 Hours</option>
                      </Select>
                    </div>

                    {userLocation && (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          <Navigation className="w-3 h-3 inline mr-1" />
                          Distance
                        </label>
                        <Select
                          value={filters.radiusKm}
                          onChange={(e) => setFilters({ ...filters, radiusKm: e.target.value })}
                          className="text-sm w-full"
                        >
                          <option value="all">All Locations</option>
                          <option value="1">Within 1 km</option>
                          <option value="5">Within 5 km</option>
                          <option value="10">Within 10 km</option>
                          <option value="25">Within 25 km</option>
                        </Select>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly}
                          onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                          Verified Only
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Incidents List */}
              <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                    <span>Nearby Incidents</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      {filteredIncidents.length}
                    </span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredIncidents.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm font-medium">No incidents found</p>
                      <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedIncident?.id === incident.id
                            ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                            : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-sm'
                        }`}
                        onClick={() => {
                          setSelectedIncident(incident);
                          navigate(`/incidents/${incident.id}`);
                        }}
                        onMouseEnter={() => setSelectedIncident(incident)}
                        onMouseLeave={() => setSelectedIncident(null)}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-3 h-3 mt-1 rounded-full flex-shrink-0 animate-pulse ${
                              incident.severity === 'critical'
                                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                                : incident.severity === 'high'
                                ? 'bg-orange-500 shadow-lg shadow-orange-500/50'
                                : incident.severity === 'medium'
                                ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                                : 'bg-green-500 shadow-lg shadow-green-500/50'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm capitalize truncate">
                              {incident.type.replace('_', ' ')}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {incident.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                incident.severity === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : incident.severity === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : incident.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {incident.severity}
                              </span>
                              {getIncidentDistance(incident) && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                  📍 {getIncidentDistance(incident)?.toFixed(1)} km
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3 h-full">
              <SimpleOSMap
                incidents={filteredIncidents}
                userLocation={userLocation}
                selectedIncident={selectedIncident}
                onIncidentClick={(incident) => {
                  setSelectedIncident(incident);
                  navigate(`/incidents/${incident.id}`);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto">
            {filteredIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                distance={getIncidentDistance(incident)}
                onClick={() => navigate(`/incidents/${incident.id}`)}
              />
            ))}
            {filteredIncidents.length === 0 && (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">No incidents found</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}