import { normalizeIncident } from '../utils/helpers';
import type { Incident } from '../types';

// Raw mock data provided by user; adjusted to simple JSON (no $oid/$date wrappers)
const rawMockIncidents = [
  {
    _id: '69512fcf635039531461f361',
    title: 'Fire',
    description: 'There was a fire in my residential building',
    type: 'fire',
    location: {
      type: 'Point',
      coordinates: [72.8227334, 19.4126475],
    },
    severity: 'high',
    status: 'VERIFIED',
    reportedBy: '69512f0b635039531461f35f',
    assignedTo: 'Fire_Department_Unit_3',
    imageUrl: null,
    createdAt: '2025-12-28T13:25:35.780Z',
    updatedAt: '2025-12-28T14:48:24.773Z',
    __v: 0,
  },
  {
    _id: '69513a8a635039531461f402',
    title: 'Road Accident',
    description: 'Two vehicles collided near the highway junction',
    type: 'accident',
    location: {
      type: 'Point',
      coordinates: [72.8301251, 19.4178923],
    },
    severity: 'critical',
    status: 'IN_PROGRESS',
    reportedBy: '69513a20635039531461f3e1',
    assignedTo: 'Traffic_Police_Unit_1',
    imageUrl: 'https://cdn.example.com/incidents/accident_402.jpg',
    createdAt: '2025-12-28T14:05:12.102Z',
    updatedAt: '2025-12-28T14:10:45.410Z',
    __v: 0,
  },
  {
    _id: '69513e2b635039531461f420',
    title: 'Medical Emergency',
    description: 'Elderly person collapsed at a bus stop',
    type: 'medical',
    location: {
      type: 'Point',
      coordinates: [72.8193412, 19.4085129],
    },
    severity: 'medium',
    status: 'UNVERIFIED',
    reportedBy: '69513dfe635039531461f418',
    assignedTo: null,
    imageUrl: null,
    createdAt: '2025-12-28T15:02:18.556Z',
    updatedAt: '2025-12-28T15:02:18.556Z',
    __v: 0,
  },
  {
    _id: '6951417b635039531461f441',
    title: 'Suspicious Activity',
    description: 'Group of people attempting to break into a parked vehicle',
    type: 'security', // mapped from 'crime' to existing type
    location: {
      type: 'Point',
      coordinates: [72.825891, 19.4201146],
    },
    severity: 'medium',
    status: 'VERIFIED',
    reportedBy: '69514121635039531461f43b',
    assignedTo: 'Police_Unit_7',
    imageUrl: 'https://cdn.example.com/incidents/crime_441.jpg',
    createdAt: '2025-12-28T16:10:33.874Z',
    updatedAt: '2025-12-28T16:20:11.390Z',
    __v: 0,
  },
  {
    _id: '695145aa635039531461f460',
    title: 'Water Logging',
    description: 'Heavy water logging due to continuous rainfall',
    type: 'natural_disaster', // mapped from 'disaster' to existing type
    location: {
      type: 'Point',
      coordinates: [72.8156228, 19.3992345],
    },
    severity: 'high',
    status: 'RESOLVED',
    reportedBy: '6951454e635039531461f459',
    assignedTo: 'Municipal_Corporation_Unit_2',
    imageUrl: 'https://cdn.example.com/incidents/flood_460.jpg',
    createdAt: '2025-12-27T22:45:09.120Z',
    updatedAt: '2025-12-28T06:30:55.300Z',
    __v: 0,
  },
  {
    _id: '695149cd635039531461f478',
    title: 'Bridge Damage',
    description: 'Reported crack on flyover bridge',
    type: 'accident', // mapped from 'infrastructure' to closest existing type
    location: {
      type: 'Point',
      coordinates: [72.8401114, 19.4257123],
    },
    severity: 'low',
    status: 'FALSE_REPORT',
    reportedBy: '69514971635039531461f472',
    assignedTo: null,
    imageUrl: null,
    createdAt: '2025-12-28T10:15:44.809Z',
    updatedAt: '2025-12-28T11:05:21.555Z',
    __v: 0,
  },
];

export function getMockIncidents(): Incident[] {
  return rawMockIncidents.map(normalizeIncident);
}
