const fs = require('fs').promises;
const {
  createNew,
  getAllFolders,
  getFolder,
  getFolderContents,
  updateFolder,
  deleteFolder,
} = require('../models/folderModel');
const { uploadFile } = require('../models/fileModel');

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const createNewFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const folder = await createNew(name, req.user.id, parentId);
    res.json(folder);
  } catch (error) {
    console.error('Create error', error);
    res.status(500).json({ message: 'Error creating folder' });
  }
};

const fetchUserFolders = async (req, res) => {
  try {
    const folders = await getAllFolders(req.user.id);
    res.json(folders);
  } catch (error) {
    console.error('Fetching error', error);
    res.status(500).json({ message: 'Error fetching folders' });
  }
};

const fetchFolder = async (req, res) => {
  try {
    const folder = await getFolder(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(folder);
  } catch (error) {
    console.error('Fetching error', error);
    res.status(500).json({ message: 'Error fetching folder' });
  }
};

const fetchFolderContents = async (req, res) => {
  try {
    const folder = await getFolder(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const contents = await getFolderContents(req.params.id);
    res.json(contents);
  } catch (error) {
    console.error('Fetching error', error);
    res.status(500).json({ message: 'Error fetching contents' });
  }
};

const handleUpdate = async (req, res) => {
  try {
    const { name } = req.body;
    const folder = await updateFolder(req.params.id, name);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(folder);
  } catch (error) {
    console.error('Update error', error);
    res.status(500).json({ message: 'Error updating folder' });
  }
};

const handleDelete = async (req, res) => {
  try {
    const folder = await getFolder(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check ownership
    if (folder.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await deleteFolder(req.params.id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete error', error);
    res.status(500).json({ message: 'Error deleting folder' });
  }
};

const handleFolderUpload = async (req, res) => {
  try {
    // Verify folder exists and user owns it
    const folder = await getFolder(req.params.id);
    console.log('Folder: ', folder)
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    if (folder.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    console.log('File to upload: ', req.file)
    
    // Handle file upload
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (req.file.size > MAX_FILE_SIZE) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'File too large (max 20MB)' });
    }

    const file = await uploadFile(req.file, req.user.id, folder.id);
    console.log('File uploaded: ', file)
    res.json(file);
  } catch (error) {
    if (req.file) {
      await fs.link(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading file' });
  }
};

module.exports = {
  createNewFolder,
  fetchUserFolders,
  fetchFolder,
  fetchFolderContents,
  handleUpdate,
  handleDelete,
  handleFolderUpload
}
