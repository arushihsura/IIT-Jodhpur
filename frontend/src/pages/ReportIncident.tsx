import { useState } from 'react';
import { MapPin, Image as ImageIcon, CheckCircle, Upload, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { IncidentTypeIcon } from '../components/IncidentTypeIcon';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IncidentType, IncidentSeverity } from '../types';
import { getUserLocation } from '../utils/helpers';

export function ReportIncident() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [incidentId, setIncidentId] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    type: 'accident' as IncidentType,
    description: '',
    severity: 'medium' as IncidentSeverity,
    location_lat: 0,
    location_lng: 0,
    location_address: '',
  });

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      
      if (!isUnder10MB) {
        showError(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      return isImage || isVideo;
    });

    if (validFiles.length === 0) return;

    setMediaFiles(prev => [...prev, ...validFiles].slice(0, 5));

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });

    showSuccess(`${validFiles.length} file(s) added`);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = async () => {
    try {
      const location = await getUserLocation();
      setFormData((prev) => ({
        ...prev,
        location_lat: location.lat,
        location_lng: location.lng,
      }));
      showSuccess('Location detected successfully');
    } catch (error) {
      console.error('Error getting location:', error);
      showError('Unable to get your location. Please check permissions.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location_lat || !formData.location_lng) {
      showError('Please set your location');
      return;
    }

    setLoading(true);

    try {
      const data = await api.incidents.create({
        title: formData.type,
        description: formData.description,
        type: formData.type.toLowerCase(),
        severity: formData.severity.toLowerCase(),
        location: {
          type: 'Point',
          coordinates: [formData.location_lng, formData.location_lat],
        },
        reportedBy: user?.id || 'anonymous',
      });

      setIncidentId(data.id);
      setShowSuccessModal(true);
      showSuccess('Incident reported successfully!');
      
      // Reset form
      setFormData({
        type: 'accident',
        description: '',
        severity: 'medium',
        location_lat: 0,
        location_lng: 0,
        location_address: '',
      });
      setMediaFiles([]);
      setMediaPreviews([]);
    } catch (error) {
      console.error('Error reporting incident:', error);
      showError('Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Incident</h1>
          <p className="text-gray-600 mb-8">
            Provide as much detail as possible to help first responders assess and respond quickly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Incident Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as IncidentType })
              }
              required
            >
              <option value="accident">Accident</option>
              <option value="fire">Fire</option>
              <option value="security">Crime/Security</option>
              <option value="medical">Medical Emergency</option>
              <option value="natural_disaster">Natural Disaster</option>
            </Select>

            <Select
              label="Severity"
              value={formData.severity}
              onChange={(e) =>
                setFormData({ ...formData, severity: e.target.value as IncidentSeverity })
              }
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe what happened..."
                required
              />
            </div>

            {/* Media Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos/Videos (Optional, Max 5 files, 10MB each)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="media-upload"
                  disabled={mediaFiles.length >= 5}
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {mediaFiles.length}/5 files uploaded
                  </span>
                </label>
              </div>

              {/* Media Previews */}
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                  {formData.location_lat && formData.location_lng ? (
                    <p className="text-sm text-gray-600">
                      Location set: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">No location set</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetLocation}
                    className="mt-2"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Detect My Location
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Incident Report'}
              </Button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                {user
                  ? 'Your report will be linked to your account'
                  : 'Your report will be submitted anonymously'}
              </p>
            </div>
          </form>
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} size="md">
        <div className="text-center py-6">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your incident has been reported successfully. Emergency responders have been notified.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Incident ID</p>
            <p className="font-mono text-lg font-semibold text-gray-900">{incidentId}</p>
          </div>
          <Button onClick={() => setShowSuccessModal(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
