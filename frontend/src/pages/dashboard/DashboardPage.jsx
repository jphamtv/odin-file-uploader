import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthContext";
import { fileApi, folderApi } from "../../services/api";
import ContentList from "../../components/ContentList";
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [folder, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState({
    id: null, // null means root folder
    path: [{id: null, name: 'My Files'}]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadContents();
  }, [currentFolder.id]); // reload when folder changes

  const loadContents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (currentFolder.id === null) {
        // Root folder - get all root files and folders
        const [filesData, foldersData] = await Promise.all([
          fileApi.getFiles(),
          folderApi.getAll()
        ]);
        setFiles(filesData.files || []);
        // Filter for root folders (those without parentId)
        setFolders(foldersData.folders?.filter(f => !f.parentId) || []);
      } else {
        // Specific folder - get its contents
        const contents = await folderApi.getContents(currentFolder.id);
        setFiles(contents.files || []);
        setFolders(contents.folders || []);
      }
    } catch (error) {
      setError('Failed to load contents');
      console.error('Error loading contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await fileApi.upload(file);
      await loadFiles(); // Reload the file list
      event.target.value = ''; // Reset file input
    } catch (error) {
      setError('Upload failed');
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleFolderClick = async (folderId) {
    try {
      const folderInfo = await folderApi.get(folderId);
      setCurrentFolder(prev => ({
        id: folderId,
        path: [...prev.path, { id: folderId, name: folderInfo.name}]
      }));
    } catch (error) {
      setError('Failed to open folder');
      console.error('Navigation error: ', error);
    }
  };

  const handleFolderDelete = async (folderId) => {
    try {
      await folderApi.delete(folderId);
      setFolders(prevFolders => prevFolders.filter(f => f.id !== folderId));
    } catch (error) {
      setError('Failed to delete folder');
      console.error('Folder deletion error: ', error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setLoading(true);
      await folderApi.create(newFolderName, currentFolder.id);
      setNewFolderName('');
      setShowNewFolderInput(false);
      await loadContents(); // Reload to show new folder
    } catch (error) {
      setError('Failed to create new folder');
      console.error('Folder creation error: ', error);
    } finally {
      setLoading(false);
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button 
            className="action-button"
            onClick={handleUploadClick}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
          {/* New Folder button disabled for now */}
          <button className="action-button" disabled>
            New Folder
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="content-area">
          {loading && !files.length ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <FileList 
              files={files}
              onFileDelete={handleFileDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;