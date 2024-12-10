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
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState({
    id: null, // null means root folder
    path: [{id: null, name: 'My Files'}]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Safeguards for file upload
  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const ALLOWED_FILE_TYPES = [
    // Images
    'image/jpeg',
    'image/png',
    
    // Documents
    'application/pdf',
    'text/plain',

    // Videos
    'video/mp4',
    'video/quicktime',  // .mov files
    'video/x-msvideo',  // .avi files
    'video/webm',
    'video/x-matroska',  // .mkv files
  ]; 

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
        console.log('Files Data:', filesData);  
        console.log('Folders Data:', foldersData);  
        setFiles(filesData || []);
        // Filter for root folders (those without parentId)
        setFolders(foldersData?.filter(f => !f.parentId) || []);
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
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    // Validation checks
    if (selectedFiles.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files at once`);
      event.target.value = '';
      return;
    }

    // Validate each file
    const invalidFiles = selectedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        return `${file.name} is too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return `${file.name} has unsupported file type`;
      }
      return false;
    });

    if (invalidFiles > 0) {
      setError('Some files cannot be uploaded: ' + invalidFiles.join(', '));
      event.target.value = '';
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload all valid files
      await Promise.all(
        selectedFiles.map(file => fileApi.upload(file, currentFolder.id))
      );

      await loadContents(); // Reload the content list
      event.target.value = ''; // Reset file input
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleFolderClick = async (folderId) => {
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

      <div className="breadcrumb">
        {currentFolder.path.map((item, index) => (
          <span key={item.id || 'root'}>
            {index > 0 && ' / '}
            <button
              onClick={() => {
                // Set current folder to this level
                setCurrentFolder({
                  id: item.id,
                  path: currentFolder.path.slice(0, index + 1)
                });
              }}
              className="breadcrumb-button"
            >
              {item.name}
            </button>
          </span>
        ))}
      </div>

      <main className="dashboard-main">
        <div className="actions-bar">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept={ALLOWED_FILE_TYPES.join(',')} // Limit file picker to allowed types
            style={{ display: 'none' }}
          />
          <button 
            className="action-button"
            onClick={handleUploadClick}
            disabled={loading}
            title={`Upload up to ${MAX_FILES} files (max ${MAX_FILE_SIZE / 1024 / 1024}MB each)`}
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
          <button
            className="action-button"
            onClick={() => setShowNewFolderInput(true)}
            disabled={loading || showNewFolderInput}
          >
            New Folder
          </button>
        </div>

        {/* New folder input form */}
        {showNewFolderInput && (
          <form
            onSubmit={handleCreateFolder}
            className="new-folder-form"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
              maxLength={255}
            />
            <button
              type="submit"
              disabled={loading}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
            >
              Cancel
            </button>
          </form>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="content-area">
          {loading && !files.length && !folders.length ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <ContentList 
              files={files}
              folders={folders}
              onFileDelete={handleFileDelete}
              onFolderDelete={handleFolderDelete}
              onFolderClick={handleFolderClick}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;