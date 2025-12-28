import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Menu, X, LogOut, User, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, isResponder, isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadge = () => {
    if (!profile) return null;
    const roleColors: Record<string, { bg: string; text: string; label: string }> = {
      citizen: { bg: 'bg-green-100', text: 'text-green-700', label: 'Citizen' },
      responder: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Responder' },
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
    };
    const roleStyle = roleColors[profile.role] || roleColors.citizen;
    
    return (
      <div className={`${roleStyle.bg} ${roleStyle.text} text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1`}>
        <Shield className="w-3 h-3" />
        {roleStyle.label}
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://res.cloudinary.com/dqac5kjhq/image/upload/v1766939339/Gemini_Generated_Image_oa3floa3floa3flo-removebg-preview_sjb2kt.png" alt="CrisisNet" className="h-16 md:h-20 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                isActive('/') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/incidents"
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                isActive('/incidents') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Live Feed
            </Link>
            
            {profile?.role === 'citizen' && (
              <Link
                to="/report"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  isActive('/report') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Report Incident
              </Link>
            )}

            {isResponder && (
              <Link
                to="/responder"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  isActive('/responder') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Responder Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  isActive('/admin') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
                <div className="flex flex-col items-end">
                  {getRoleBadge()}
                  <span className="text-sm text-gray-600 mt-1 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {profile?.email}
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-blue-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/incidents"
              className="block text-gray-700 hover:text-blue-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Live Feed
            </Link>
            
            {profile?.role === 'citizen' && (
              <Link
                to="/report"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Report Incident
              </Link>
            )}

            {isResponder && (
              <Link
                to="/responder"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Responder Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="border-t border-gray-200 pt-3">
                <div className="mb-2">{getRoleBadge()}</div>
                <p className="text-sm text-gray-600 mb-2">{profile?.email}</p>
                <Button size="sm" variant="outline" onClick={signOut} className="w-full">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
