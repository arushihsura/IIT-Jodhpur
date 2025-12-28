import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, AlertCircle, MapPin, Clock, Navigation2, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { Incident, IncidentStatus, AssignmentType } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

export function ResponderDashboard() {
  const navigate = useNavigate();
  const { isResponder, user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [assignedIncidents, setAssignedIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'assigned' | 'all'>('assigned');

  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    sortBy: 'severity',
  });

  useEffect(() => {
    if (!isResponder) {
      navigate('/login');
      return;
    }

    fetchIncidents();

    // Polling for new incidents every 5 seconds
    const pollInterval = setInterval(fetchIncidents, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [isResponder, navigate]);

  const fetchIncidents = async () => {
    try {
      const data = await api.incidents.getAll();

      let sorted = data || [];
      // Filter out resolved incidents
      sorted = sorted.filter((inc: Incident) => inc.status !== 'resolved');

      // Separate assigned vs unassigned
      const assigned = sorted.filter((inc: Incident) => inc.assignment && inc.assignment.length > 0);
      const unassigned = sorted.filter((inc: Incident) => !inc.assignment || inc.assignment.length === 0);

      if (filters.sortBy === 'severity') {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        sorted = sorted.sort(
          (a: Incident, b: Incident) =>
            (severityOrder[a.severity as keyof typeof severityOrder] || 4) -
            (severityOrder[b.severity as keyof typeof severityOrder] || 4)
        );
        assigned.sort(
          (a: Incident, b: Incident) =>
            (severityOrder[a.severity as keyof typeof severityOrder] || 4) -
            (severityOrder[b.severity as keyof typeof severityOrder] || 4)
        );
      } else if (filters.sortBy === 'time') {
        sorted = sorted.sort(
          (a: Incident, b: Incident) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        assigned.sort(
          (a: Incident, b: Incident) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      setIncidents(sorted);
      setAssignedIncidents(assigned);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: IncidentStatus, assignment?: AssignmentType) => {
    if (!selectedIncident) return;

    setActionLoading(true);

    try {
      const updateData: any = {};

      // Map status values - handle uppercase variants
      if (newStatus) {
        const statusMap: { [key: string]: string } = {
          VERIFIED: 'VERIFIED',
          ASSIGNED: 'VERIFIED',
          IN_PROGRESS: 'IN_PROGRESS',
          RESOLVED: 'resolved',
          FALSE_REPORT: 'FALSE_REPORT',
        };

        updateData.status = statusMap[newStatus] || newStatus;
      }

      // Add assignment if provided
      if (assignment) {
        updateData.assignment = [assignment];
      }

      console.log('Updating incident with:', updateData);
      await api.incidents.update(selectedIncident.id, updateData);

      setShowActionModal(false);
      setSelectedIncident(null);
      
      // Fetch fresh data
      await fetchIncidents();
      
      // Show success message
      alert('Incident updated successfully!');
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (note: string) => {
    if (!selectedIncident) return;

    setActionLoading(true);

    try {
      await api.incidents.update(selectedIncident.id, {
        notes: note,
      });

      setShowActionModal(false);
      setSelectedIncident(null);
      fetchIncidents();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowActionModal(true);
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filters.status !== 'all' && inc.status !== filters.status) return false;
    if (filters.severity !== 'all' && inc.severity !== filters.severity) return false;
    return true;
  });

  const stats = {
    unverified: incidents.filter((inc) => inc.status === 'UNVERIFIED').length,
    inProgress: incidents.filter((inc) => inc.status === 'IN_PROGRESS').length,
    critical: incidents.filter((inc) => inc.severity === 'CRITICAL').length,
    assigned: assignedIncidents.length,
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      CRITICAL: 'bg-red-100 text-red-800 border border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border border-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      LOW: 'bg-green-100 text-green-800 border border-green-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS':
        return <Zap className="w-4 h-4" />;
      case 'VERIFIED':
        return <CheckCircle className="w-4 h-4" />;
      case 'UNVERIFIED':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isResponder) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Responder Dashboard</h1>
          <p className="text-gray-600">Manage and respond to active incidents</p>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Assigned</p>
                <p className="text-3xl font-bold text-gray-900">{stats.assigned}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Navigation2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unverified</p>
                <p className="text-3xl font-bold text-gray-900">{stats.unverified}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Critical</p>
                <p className="text-3xl font-bold text-gray-900">{stats.critical}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'assigned'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Navigation2 className="w-4 h-4 inline mr-2" />
            Assigned Queue ({stats.assigned})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            All Incidents ({incidents.length})
          </button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'assigned' ? 'Assigned Incidents Queue' : 'All Incidents'}
              </h2>
              <p className="text-sm text-gray-600">
                {activeTab === 'assigned' ? `${assignedIncidents.length} assigned incidents` : `${incidents.length} total incidents`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="VERIFIED">Verified</option>
                <option value="IN_PROGRESS">In Progress</option>
              </Select>

              <Select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="text-sm"
              >
                <option value="all">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Select>

              <Select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="text-sm"
              >
                <option value="severity">Sort by Severity</option>
                <option value="time">Sort by Time</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Incident Queue */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-600 py-12">Loading incidents...</p>
          ) : (activeTab === 'assigned' ? assignedIncidents : incidents).length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {activeTab === 'assigned'
                  ? 'No assigned incidents. Great job!'
                  : 'No incidents to display'}
              </p>
            </div>
          ) : (
            (activeTab === 'assigned' ? assignedIncidents : incidents).map((incident) => (
              <Card
                key={incident.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                style={{
                  borderLeftColor: incident.severity === 'CRITICAL' ? '#ef4444' : incident.severity === 'HIGH' ? '#f97316' : incident.severity === 'MEDIUM' ? '#eab308' : '#22c55e',
                }}
                onClick={() => openActionModal(incident)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left: Incident Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">{getStatusIcon(incident.status)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {incident.type}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                        {incident.status}
                      </span>
                      {incident.assignment && incident.assignment.length > 0 && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-300">
                          Assigned to {incident.assignment.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {(incident.location_address || (incident.location && incident.location.coordinates)) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {incident.location_address || (incident.location?.coordinates ? `${incident.location.coordinates[1]}, ${incident.location.coordinates[0]}` : 'Unknown location')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeElapsed(incident.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="md:flex-shrink-0 w-full md:w-auto">
                    <Button
                      className="w-full md:w-auto"
                      onClick={() => openActionModal(incident)}
                    >
                      Take Action
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedIncident && (
        <Modal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          title="Incident Actions"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{selectedIncident.type}</h3>
              <p className="text-gray-700 text-sm mb-3">{selectedIncident.description}</p>
              <div className="flex gap-2">
                <Badge color="orange">{selectedIncident.severity}</Badge>
                <Badge color="gray">{selectedIncident.status}</Badge>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="success"
                  onClick={() => handleUpdateStatus('VERIFIED')}
                  disabled={actionLoading}
                >
                  Verify
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={actionLoading}
                >
                  In Progress
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={actionLoading}
                >
                  Resolve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleUpdateStatus('FALSE_REPORT')}
                  disabled={actionLoading}
                >
                  False Report
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Assign To</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedIncident.status, 'Police')}
                  disabled={actionLoading}
                >
                  Police
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedIncident.status, 'Fire')}
                  disabled={actionLoading}
                >
                  Fire
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedIncident.status, 'Medical')}
                  disabled={actionLoading}
                >
                  Medical
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedIncident.status, 'Multiple')}
                  disabled={actionLoading}
                >
                  Multiple
                </Button>
              </div>
            </div>

            {selectedIncident.responder_notes && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Internal Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedIncident.responder_notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
