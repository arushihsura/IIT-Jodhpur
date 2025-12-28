import {
  Car,
  Flame,
  Shield,
  Heart,
  AlertTriangle,
  Construction,
} from 'lucide-react';
import { IncidentType } from '../types';

interface IncidentTypeIconProps {
  type: IncidentType;
  className?: string;
}

export function IncidentTypeIcon({ type, className = 'w-6 h-6' }: IncidentTypeIconProps) {
  const normalizedType = type.toLowerCase();
  const icons: Record<string, JSX.Element> = {
    accident: <Car className={className} />,
    fire: <Flame className={className} />,
    security: <Shield className={className} />,
    crime: <Shield className={className} />,
    medical: <Heart className={className} />,
    natural_disaster: <AlertTriangle className={className} />,
    disaster: <AlertTriangle className={className} />,
    infrastructure: <Construction className={className} />,
  };

  return icons[normalizedType] || <AlertTriangle className={className} />;
}

export function getIncidentTypeColor(type: string): string {
  const normalizedType = type.toLowerCase();
  const colors: Record<string, string> = {
    accident: 'text-yellow-600 bg-yellow-50',
    fire: 'text-red-600 bg-red-50',
    security: 'text-purple-600 bg-purple-50',
    crime: 'text-purple-600 bg-purple-50',
    medical: 'text-pink-600 bg-pink-50',
    natural_disaster: 'text-orange-600 bg-orange-50',
    disaster: 'text-orange-600 bg-orange-50',
    infrastructure: 'text-gray-600 bg-gray-50',
  };

  return colors[normalizedType] || 'text-gray-600 bg-gray-50';
}
