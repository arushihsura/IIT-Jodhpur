import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, AlertTriangle, ArrowLeft, Users, ThumbsUp, Lock, Shield, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { usePermission } from '../hooks/usePermission';
import { Incident, IncidentStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { IncidentTypeIcon, getIncidentTypeColor } from '../components/IncidentTypeIcon';
import { formatTimeAgo, getSeverityColor, getStatusColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { hasPermission } = usePermission();
  const { showSuccess, showError } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmations, setConfirmations] = useState(3);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('reported');
  const [internalNotes, setInternalNotes] = useState('');
  const [assignedDept, setAssignedDept] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIncident();
      fetchConfirmations();
      checkUserConfirmation();
    }
  }, [id]);

  const fetchIncident = async () => {
    try {
      const data = await api.incidents.getById(id!);
      setIncident(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error('Error fetching incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmations = async () => {
    try {
      setConfirmations(0);
    } catch (error) {
      console.error('Error fetching confirmations:', error);
    }
  };

  const checkUserConfirmation = async () => {
    setHasConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!user) {
      showError('Please log in to confirm incidents');
      return;
    }

    setConfirming(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setHasConfirmed(true);
      setConfirmations(confirmations + 1);
      showSuccess('You confirmed this incident');
    } catch (error) {
      showError('Failed to confirm incident');
    } finally {
      setConfirming(false);
    }
  };

  const handleStatusChange = async () => {
    if (!hasPermission('change_status')) {
      showError('You do not have permission to change incident status');
      return;
    }

    setUpdatingStatus(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIncident(prev => prev ? { ...prev, status: newStatus } : null);
      showSuccess(`Status updated to ${newStatus}`);
    } catch (error) {
      showError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!hasPermission('add_internal_notes')) {
      showError('You do not have permission to add internal notes');
      return;
    }

    if (!internalNotes.trim()) {
      showError('Please enter a note');
      return;
    }

    setSavingNotes(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      showSuccess('Internal note saved');
      setInternalNotes('');
    } catch (error) {
      showError('Failed to save note');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAssignDept = async () => {
    if (!hasPermission('assign_departments')) {
      showError('You do not have permission to assign departments');
      return;
    }

    if (!assignedDept.trim()) {
      showError('Please select a department');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIncident(prev => prev ? { ...prev, assignedTo: assignedDept } : null);
      showSuccess(`Assigned to ${assignedDept}`);
      setAssignedDept('');
    } catch (error) {
      showError('Failed to assign department');
    }
  };

  const getVerificationLevel = (count: number): { level: string; color: 'gray' | 'orange' | 'yellow' | 'green' | 'blue' | 'red'; percentage: number } => {
    if (count >= 10) return { level: 'High', color: 'green', percentage: 100 };
    if (count >= 5) return { level: 'Medium', color: 'yellow', percentage: 70 };
    if (count >= 2) return { level: 'Low', color: 'orange', percentage: 40 };
    return { level: 'Unverified', color: 'gray', percentage: 10 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Incident not found</p>
          <Button onClick={() => navigate('/incidents')}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => navigate('/incidents')}
          className="mb-6 hover:bg-white hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        {/* Header Card */}
        <Card className="p-6 md:p-8 mb-6 bg-white shadow-lg border border-gray-200">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl shadow-lg ${getIncidentTypeColor(incident.type)}`}>
              <IncidentTypeIcon type={incident.type} className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 capitalize mb-3">
                {incident.type.replace('_', ' ')} Emergency
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge color={getSeverityColor(incident.severity)} className="capitalize text-sm px-3 py-1">
                  {incident.severity}
                </Badge>
                <Badge color={getStatusColor(incident.status)} className="capitalize text-sm px-3 py-1">
                  {incident.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{formatTimeAgo(incident.createdAt || incident.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{confirmations} confirmations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{new Date(incident.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Verification Progress */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Community Verification
                </h3>
                <Badge color={getVerificationLevel(confirmations).color} className="text-sm px-3 py-1">
                  {getVerificationLevel(confirmations).level}
                </Badge>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 h-4 rounded-full transition-all duration-700 shadow-lg"
                  style={{ width: `${getVerificationLevel(confirmations).percentage}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                <span className="font-semibold">{confirmations} people</span> have confirmed this incident
              </p>
              
              {!hasConfirmed ? (
                <Button
                  onClick={handleConfirm}
                  disabled={confirming}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  {confirming ? 'Confirming...' : 'I Can Confirm This'}
                </Button>
              ) : (
                <div className="flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-semibold">You confirmed this incident</span>
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">{incident.description}</p>
            </Card>

            {/* Location */}
            <Card className="p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Location
              </h2>
              
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {incident.location_address && (
                    <p className="text-gray-800 font-medium mb-2">{incident.location_address}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Coordinates: <span className="font-mono">{(incident.location_lat || 0).toFixed(6)}, {(incident.location_lng || 0).toFixed(6)}</span>
                  </p>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="mt-4 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${incident.location_lng - 0.01},${incident.location_lat - 0.01},${incident.location_lng + 0.01},${incident.location_lat + 0.01}&layer=mapnik&marker=${incident.location_lat},${incident.location_lng}`}
                  className="w-full h-64 border-0"
                  title="Incident Location"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Assigned To */}
            {incident.assignedTo && (
              <Card className="p-6 shadow-lg border border-gray-200 bg-blue-50">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Assigned To</h2>
                <Badge color="blue" className="text-base px-4 py-2">{incident.assignedTo}</Badge>
              </Card>
            )}

            {/* Responder Actions */}
            {hasPermission('change_status') && (
              <Card className="p-6 shadow-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-600" />
                  Responder Actions
                </h2>
                
                <div className="space-y-4">
                  {/* Update Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
                    <div className="flex gap-2">
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                        className="flex-1 text-sm"
                      >
                        <option value="reported">Reported</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </Select>
                      <Button 
                        onClick={handleStatusChange} 
                        disabled={updatingStatus || newStatus === incident.status} 
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        {updatingStatus ? 'Updating...' : 'Update'}
                      </Button>
                    </div>
                  </div>

                  {/* Assign Department */}
                  {hasPermission('assign_departments') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Department</label>
                      <div className="flex gap-2">
                        <Select
                          value={assignedDept}
                          onChange={(e) => setAssignedDept(e.target.value)}
                          className="flex-1 text-sm"
                        >
                          <option value="">Select Department</option>
                          <option value="Police">🚔 Police</option>
                          <option value="Fire">🚒 Fire Department</option>
                          <option value="Medical">🚑 Medical/Ambulance</option>
                          <option value="Rescue">⛑️ Rescue Team</option>
                        </Select>
                        <Button 
                          onClick={handleAssignDept} 
                          disabled={!assignedDept} 
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Internal Notes */}
                  {hasPermission('add_internal_notes') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes</label>
                      <textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Add internal notes visible only to responders..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <Button 
                        onClick={handleSaveNotes} 
                        disabled={savingNotes || !internalNotes.trim()} 
                        size="sm" 
                        className="mt-2 w-full"
                      >
                        {savingNotes ? 'Saving...' : 'Save Note'}
                      </Button>
                    </div>
                  )}

                  {/* Verify Button */}
                  {hasPermission('verify_incident') && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-3">
                        Verify the accuracy of this incident report.
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={() => showSuccess('Incident marked as verified')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Verified
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Status Timeline */}
            {incident.status !== 'reported' && (
              <Card className="p-6 shadow-lg border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Status Timeline</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Incident Reported</p>
                      <p className="text-xs text-gray-500">
                        {new Date(incident.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {incident.status !== 'reported' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          Status: {incident.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(incident.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}