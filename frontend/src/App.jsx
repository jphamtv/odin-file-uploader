import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FolderPage from './pages/dashboard/FolderPage';
import SharedFolderPage from './pages/shared/SharedFolderPage';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/share/:shareId' element={<SharedFolderPage />} />

          {/* Protected Routes */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/folders/:folderId'
            element={
              <ProtectedRoute>
                <FolderPage />
              </ProtectedRoute>
            }
          />

          {/* Error and Default Routes */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
