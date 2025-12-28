import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle, TrendingUp, Users, Edit2, Trash2, Plus, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Incident, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users'>('analytics');
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('citizen');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    falseReports: 0,
    avgResponseTime: 0,
    verificationRate: 0,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    fetchAnalytics();
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchAnalytics = async () => {
    try {
      const incidents = await api.incidents.getAll();

      const total = incidents?.length || 0;
      const active = incidents?.filter(
        (inc: Incident) => inc.status === 'reported' || inc.status === 'assigned' || inc.status === 'in_progress'
      ).length || 0;
      const resolved = incidents?.filter((inc: Incident) => inc.status === 'resolved').length || 0;
      const falseReports = 0;

      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      incidents?.forEach((inc: Incident) => {
        byType[inc.type] = (byType[inc.type] || 0) + 1;
        bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
      });

      const verified = incidents?.filter((inc: Incident) => inc.status === 'assigned').length || 0;
      const verificationRate = total > 0 ? (verified / total) * 100 : 0;

      const resolvedIncidents = incidents?.filter(
        (inc: Incident) => inc.status === 'resolved'
      ) || [];
      let totalResponseTime = 0;
      resolvedIncidents.forEach((inc: Incident) => {
        const created = new Date(inc.createdAt).getTime();
        const updated = new Date(inc.updatedAt).getTime();
        totalResponseTime += (updated - created) / (1000 * 60);
      });
      const avgResponseTime =
        resolvedIncidents.length > 0 ? totalResponseTime / resolvedIncidents.length : 0;

      setStats({
        totalIncidents: total,
        activeIncidents: active,
        resolvedIncidents: resolved,
        falseReports,
        avgResponseTime,
        verificationRate,
        byType,
        bySeverity,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.admin.getUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    setUpdatingUser(true);
    try {
      await api.admin.updateUserRole(selectedUser.id, newRole);
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));
      showSuccess(`Role updated to ${newRole}`);
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      showError('Failed to update user role');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setDeletingUser(true);
    try {
      await api.admin.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      showSuccess('User deleted successfully');
    } catch (error) {
      showError('Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    citizen: 'bg-green-100 text-green-800',
    responder: 'bg-blue-100 text-blue-800',
    admin: 'bg-purple-100 text-purple-800',
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System overview, analytics, and user management</p>

          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Management
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && activeTab === 'analytics' ? (
          <p className="text-center text-gray-600 py-12">Loading analytics...</p>
        ) : activeTab === 'analytics' ? (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Incidents</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalIncidents}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeIncidents}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resolved</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.resolvedIncidents}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">False Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.falseReports}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Avg Response Time</h2>
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.avgResponseTime.toFixed(0)}</p>
                <p className="text-sm text-gray-600 mt-1">minutes</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Verification Rate</h2>
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.verificationRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-1">of reports verified</p>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Incidents by Type</h2>
                <div className="space-y-3">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{type}</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{
                              width: `${(count / stats.totalIncidents) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-900 font-semibold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Incidents by Severity</h2>
                <div className="space-y-3">
                  {Object.entries(stats.bySeverity).map(([severity, count]) => {
                    const colors = {
                      critical: 'bg-red-600',
                      high: 'bg-orange-600',
                      medium: 'bg-yellow-600',
                      low: 'bg-gray-600',
                    };
                    return (
                      <div key={severity} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{severity}</span>
                        <div className="flex items-center">
                          <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                            <div
                              className={`h-2 rounded-full ${
                                colors[severity.toLowerCase() as keyof typeof colors] || 'bg-gray-600'
                              }`}
                              style={{
                                width: `${(count / stats.totalIncidents) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-gray-900 font-semibold">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                  setShowRoleModal(true);
                                }}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="Change role"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingUser}
                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <p className="text-sm text-gray-500 mt-4">
              Total users: <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <Modal
        open={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title="Change User Role"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">User: <strong>{selectedUser.email}</strong></p>
              <p className="text-sm text-gray-600 mb-4">Current role: <strong className="capitalize">{selectedUser.role}</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Role</label>
              <Select value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}>
                <option value="citizen">Citizen</option>
                <option value="responder">Responder</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Changing a user's role will affect their permissions immediately.
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChange}
                disabled={updatingUser || newRole === selectedUser.role}
              >
                {updatingUser ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
