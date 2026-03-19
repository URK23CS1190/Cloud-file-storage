import React, { useState } from "react";
import { uploadData } from "aws-amplify/storage";
import { apiRequest, uploadFileToS3 } from '../services/api';

function FileUpload({ auth, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Select a file first");
      return;
    }

    try {
      setUploading(true);

      const safeFileName = `${Date.now()}-${selectedFile.name}`;

      await uploadData({
        path: `public/${safeFileName}`,
        data: selectedFile,
        options: {
          contentType: selectedFile.type || "application/octet-stream",
        },
      }).result;

      setSelectedFile(null);
      onUploadComplete();
      alert("File uploaded successfully");
    } catch (error) {
      console.error(error);
      alert(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3>Upload File</h3>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default FileUpload;