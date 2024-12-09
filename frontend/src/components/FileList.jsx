import { useState } from 'react';
import { fileApi } from '../services/api';
import PropTypes from 'prop-types';
import './FileList.css';

const FileList = ({ files, onFileDelete }) => {
  const [loading, setLoading] = useState({});

  const handleDownload = async (file) => {
    try {
      setLoading(prev => ({ ...prev, [file.id]: 'downloading' }));
      const blob = await fileApi.download(file.id);
      fileApi.downloadFile(blob, file.name);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [file.id]: null }));
    }
  };

  const handleDelete = async (fileId) => {
    try {
      setLoading(prev => ({ ...prev, [fileId]: 'deleting' }));
      await fileApi.delete(fileId);
      onFileDelete(fileId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [fileId]: null }));
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

  if (!files?.length) {
    return (
      <div className="empty-state">
        <p>No files yet</p>
        <p>Upload a file to get started</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.name}</td>
              <td>{formatSize(file.size)}</td>
              <td>{formatDate(file.createdAt)}</td>
              <td>
                <button
                  onClick={() => handleDownload(file)}
                  disabled={loading[file.id] === 'downloading'}
                  className="action-button secondary"
                >
                  {loading[file.id] === 'downloading' ? 'Downloading...' : 'Download'}
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={loading[file.id] === 'deleting'}
                  className="action-button secondary danger"
                >
                  {loading[file.id] === 'deleting' ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

FileList.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ),
  onFileDelete: PropTypes.func.isRequired
};

export default FileList;
