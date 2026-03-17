import React from "react";
import { useState } from 'react';
import { apiRequest, uploadFileToS3 } from '../services/api';

function FileUpload({ auth, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Select a file first');
      return;
    }

    try {
      setUploading(true);
      const { uploadUrl, key, fileId } = await apiRequest(
        '/files/upload-url',
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: selectedFile.name,
            contentType: selectedFile.type || 'application/octet-stream',
          }),
        },
        auth
      );

      await uploadFileToS3(uploadUrl, selectedFile);

      await apiRequest(
        '/files/finalize-upload',
        {
          method: 'POST',
          body: JSON.stringify({
            fileId,
            key,
            fileName: selectedFile.name,
            contentType: selectedFile.type || 'application/octet-stream',
            size: selectedFile.size,
          }),
        },
        auth
      );

      setSelectedFile(null);
      onUploadComplete();
      alert('File uploaded successfully');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3>Upload File</h3>
      <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default FileUpload;
