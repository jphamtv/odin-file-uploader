// src/pages/dashboard/DashboardPage.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthContext";
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My files</h1>
        <div className="user-controls">
          <span>Welcome, {user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="actions-bar">
          <button className="action-button">
            Upload File
          </button>
          <button className="action-button">
            New Folder
          </button>
        </div>

        <div className="content-area">
          <div className="empty-state">
            <p>No files or folders yet</p>
            <p>Upload a file or create a folder to get started</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
