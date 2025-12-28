import { MapPin, CheckCircle } from 'lucide-react';
import { Incident } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { IncidentTypeIcon, getIncidentTypeColor } from './IncidentTypeIcon';
import { formatTimeAgo, formatDistance, getSeverityColor, getStatusColor } from '../utils/helpers';

interface IncidentCardProps {
  incident: Incident;
  distance?: number;
  onClick?: () => void;
}

export function IncidentCard({ incident, distance, onClick }: IncidentCardProps) {
  const createdDate = incident.createdAt || incident.created_at;
  const address = incident.location_address;
  const severity = incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1);
  const status = (incident.status || '').replace('_', ' ').toUpperCase();
  
  return (
    <Card className="p-4" hover onClick={onClick}>
      <div className="flex items-start space-x-3">
        <div className={`p-3 rounded-lg ${getIncidentTypeColor(incident.type)}`}>
          <IncidentTypeIcon type={incident.type} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{incident.title || incident.type}</h3>
              <p className="text-sm text-gray-500">{formatTimeAgo(createdDate)}</p>
            </div>
            <Badge color={getSeverityColor(incident.severity)} size="sm">
              {severity}
            </Badge>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{incident.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {distance !== undefined
                    ? formatDistance(distance)
                    : address || 'Location'}
                </span>
              </div>
              {(incident.verification_score || 0) > 0 && (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  <span>{incident.verification_score} confirmations</span>
                </div>
              )}
            </div>

            <Badge color={getStatusColor(incident.status)} size="sm">
              {status}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
