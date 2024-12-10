import { useState } from 'react';
import PropTypes from 'prop-types';
import { fileApi, folderApi } from '../services/api';
import './ContentList.css';

const ContentList = ({ files, folders, onFileDelete, onFolderDelete, onFolderClick }) => {
  const [loading, setLoading] = useState({});

  const handleDownload = async (file) => {
    try {
      setLoading(prev => ({ ...prev, [`file-${file.id}`]: 'downloading' }));
      const blob = await fileApi.download(file.id);
      fileApi.downloadFile(blob, file.name);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`file-${file.id}`]: null }));
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      setLoading(prev => ({ ...prev, [`file-${fileId}`]: 'deleting' }));
      await fileApi.delete(fileId);
      onFileDelete(fileId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`file-${fileId}`]: null }));
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      setLoading(prev => ({ ...prev, [`folder-${folderId}`]: 'deleting' }));
      await folderApi.delete(folderId);
      onFolderDelete(folderId);
    } catch (error) {
      console.error('Delete folder failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`folder-${folderId}`]: null }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sort folders and files alphabetically
  const sortedFolders = [...(folders || [])].sort((a, b) => 
    a.name.localeCompare(b.name));
  const sortedFiles = [...(files || [])].sort((a, b) => 
    a.name.localeCompare(b.name));

  if (!sortedFiles.length && !sortedFolders.length) {
    return (
      <div className="empty-state">
        <p>No files or folders yet</p>
        <p>Upload a file or create a folder to get started</p>
      </div>
    );
  }

  return (
    <div className="content-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Folders first */}
          {sortedFolders.map((folder) => (
            <tr key={`folder-${folder.id}`} className="folder-row">
              <td>
                <button 
                  className="folder-name-button"
                  onClick={() => onFolderClick(folder.id)}
                >
                  📁 {folder.name}
                </button>
              </td>
              <td>Folder</td>
              <td>-</td>
              <td>{formatDate(folder.createdAt)}</td>
              <td>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  disabled={loading[`folder-${folder.id}`] === 'deleting'}
                  className="action-button secondary danger"
                >
                  {loading[`folder-${folder.id}`] === 'deleting' ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
          
          {/* Then files */}
          {sortedFiles.map((file) => (
            <tr key={`file-${file.id}`}>
              <td>
                <span className="file-name">📄 {file.name}</span>
              </td>
              <td>File</td>
              <td>{formatSize(file.size)}</td>
              <td>{formatDate(file.createdAt)}</td>
              <td>
                <button
                  onClick={() => handleDownload(file)}
                  disabled={loading[`file-${file.id}`] === 'downloading'}
                  className="action-button secondary"
                >
                  {loading[`file-${file.id}`] === 'downloading' ? 'Downloading...' : 'Download'}
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  disabled={loading[`file-${file.id}`] === 'deleting'}
                  className="action-button secondary danger"
                >
                  {loading[`file-${file.id}`] === 'deleting' ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ContentList.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ),
  folders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ),
  onFileDelete: PropTypes.func.isRequired,
  onFolderDelete: PropTypes.func.isRequired,
  onFolderClick: PropTypes.func.isRequired
};

ContentList.defaultProps = {
  files: [],
  folders: []
};

export default ContentList;