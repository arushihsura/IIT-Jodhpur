import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Radio, CheckCircle, Zap, Shield, Users, ArrowRight, MapPin, Clock, TrendingUp, Smartphone, BarChart3, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export function Landing() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-blue-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/dqac5kjhq/image/upload/v1766939339/Gemini_Generated_Image_oa3floa3floa3flo-removebg-preview_sjb2kt.png" alt="CrisisNet" className="h-12 md:h-14 w-auto rounded-lg shadow-sm" />
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Welcome, {user.name || user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-700">Real-Time Emergency Network</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Rapid Response
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Saves Lives</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            CrisisNet connects citizens and responders in real-time. Report incidents instantly, get verified updates, and enable coordinated emergency response when every second counts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/report">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                <AlertCircle className="w-5 h-5 mr-2" />
                Report an Emergency
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/incidents">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50">
                <Radio className="w-5 h-5 mr-2" />
                View Live Incidents
              </Button>
            </Link>
          </div>

          {/* Hero Image/Graphic */}
          <div className="relative h-20 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-blue-300/20 to-transparent blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🚨</div>
                <p className="text-gray-600 font-semibold">Real-time incident tracking dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why CrisisNet?
          </h2>
          <p className="text-xl text-gray-600">Industry-leading features for emergency response</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group relative bg-white rounded-xl p-8 border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/5 rounded-xl transition-all duration-300"></div>
            <div className="relative">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-all duration-300">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Real-time incident reporting with instant notifications. Emergency services receive alerts in seconds, not minutes.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-white rounded-xl p-8 border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/5 rounded-xl transition-all duration-300"></div>
            <div className="relative">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-all duration-300">
                <CheckCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Verified</h3>
              <p className="text-gray-600">
                Multiple verifications ensure accuracy and reduce false reports. Trust the crowd, support the responders.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-white rounded-xl p-8 border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/5 rounded-xl transition-all duration-300"></div>
            <div className="relative">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-all duration-300">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Location Precise</h3>
              <p className="text-gray-600">
                GPS-accurate incident locations with interactive maps. Responders know exactly where to go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-200">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to save lives</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-blue-600/50">
              1
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Report</h3>
            <p className="text-gray-600">
              Quickly report an emergency with photo, location, and description. Your alert reaches responders instantly.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-blue-500/50">
              2
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Verify</h3>
            <p className="text-gray-600">
              Community members and professionals confirm the incident. Verification increases response priority and accuracy.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-blue-600/50">
              3
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Respond</h3>
            <p className="text-gray-600">
              Emergency services coordinate rapid response. Real-time updates keep everyone informed throughout the incident.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              85%
            </div>
            <p className="text-gray-700 text-lg font-semibold">Faster Response</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent mb-2">
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              99.9%
            </div>
            <p className="text-gray-700 text-lg font-semibold">Uptime</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              100%
            </div>
            <p className="text-gray-700 text-lg font-semibold">Secure</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              24/7
            </div>
            <p className="text-gray-700 text-lg font-semibold">Available</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-200">
        <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-100 border-2 border-blue-300 rounded-2xl p-12 text-center shadow-lg">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join CrisisNet today. Whether you're a citizen, responder, or emergency services professional, we've got the right tools for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/report">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg">
                <AlertCircle className="w-5 h-5 mr-2" />
                Report Now
              </Button>
            </Link>
            {!user && (
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-400 text-blue-700 hover:bg-blue-100">
                  Sign In to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-200 bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://res.cloudinary.com/dqac5kjhq/image/upload/v1766939339/Gemini_Generated_Image_oa3floa3floa3flo-removebg-preview_sjb2kt.png" alt="CrisisNet" className="h-10 md:h-12 w-auto rounded-lg shadow-sm" />
              </div>
              <p className="text-gray-700 text-sm">Real-time emergency response network.</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li><Link to="/incidents" className="hover:text-blue-600 transition">Live Incidents</Link></li>
                <li><Link to="/report" className="hover:text-blue-600 transition">Report Emergency</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 transition">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3">For Responders</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li><Link to="/login" className="hover:text-blue-600 transition">Responder Dashboard</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 transition">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li><a href="#" className="hover:text-blue-600 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-200 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2025 CrisisNet. Real-time Emergency Response Network. Saving lives, one incident at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
