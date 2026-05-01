import { useCallback, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import ModernLandingPage from './pages/ModernLandingPage';
import Jobs from './pages/Jobs';
import PrepareInterview from './pages/PrepareInterview';
import UploadResume from './pages/UploadResume';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import GridBackground from './components/UI/grid-background';
import TubesSplashScreen from './components/UI/TubesSplashScreen';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <div className="flex justify-center items-center h-screen font-medium text-blue-600">Loading...</div>;
  return isSignedIn ? children : <Navigate to="/sign-in" />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    // Mark app as ready after fonts are loaded
    const checkFonts = () => {
      if (document.body.classList.contains('fonts-loaded')) {
        setIsAppReady(true);
      } else {
        setTimeout(checkFonts, 100);
      }
    };

    // Start checking after a small delay
    const timer = setTimeout(checkFonts, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GridBackground className="text-[var(--color-text)]">
      {showSplash && <TubesSplashScreen onFinish={handleSplashFinish} />}
      <div className={`transition-opacity duration-500 ${isAppReady && !showSplash ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar />
        <div>
          <Routes>
            <Route path="/" element={<ModernLandingPage />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/prepare-interview" element={<PrepareInterview />} />
            <Route path="/upload-resume" element={
              <ProtectedRoute>
                <UploadResume />
              </ProtectedRoute>
            } />
            <Route path="/role-selection" element={<RoleSelectionPage />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </GridBackground>
  );
}
