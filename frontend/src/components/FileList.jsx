import React from "react";
import { useState } from 'react';

function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

function FileList({ files, onDownload, onDelete, onShare, loading }) {
  const [shareInputs, setShareInputs] = useState({});

  return (
    <div className="card">
      <div className="section-header">
        <h3>Your Files</h3>
        <p className="muted">Create a protected share link and allow specific users only.</p>
      </div>

      {loading ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p className="muted">No files uploaded yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Allowed User</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.fileId}>
                  <td>{file.fileName}</td>
                  <td>{formatBytes(file.size)}</td>
                  <td>
                    <input
                      type="text"
                      placeholder="allowed user sub or email"
                      value={shareInputs[file.fileId] || ''}
                      onChange={(e) =>
                        setShareInputs((prev) => ({ ...prev, [file.fileId]: e.target.value }))
                      }
                    />
                  </td>
                  <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                  <td className="action-buttons">
                    <button onClick={() => onDownload(file.key)}>Download</button>
                    <button onClick={() => onShare(file.fileId, shareInputs[file.fileId] || '')}>Share</button>
                    <button className="danger" onClick={() => onDelete(file.key)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FileList;
