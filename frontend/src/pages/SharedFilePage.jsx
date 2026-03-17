import React from "react";
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function SharedFilePage({ auth, shareId }) {
  const [loading, setLoading] = useState(true);
  const [publicInfo, setPublicInfo] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const info = await fetch(`${base}/files/public-share/${shareId}`).then((res) => res.json());
        setPublicInfo(info);

        const data = await apiRequest(`/files/shared/${shareId}/access`, { method: 'GET' }, auth);
        setResult(data);
      } catch (error) {
        setResult({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [shareId]);

  return (
    <div className="container center-screen">
      <div className="card auth-card">
        <h1>Protected Shared File</h1>

        {publicInfo && (
          <div className="note-box">
            <p><strong>File:</strong> {publicInfo.fileName}</p>
            <p><strong>Status:</strong> {publicInfo.status}</p>
            <p className="muted">Authentication is required before access is granted.</p>
          </div>
        )}

        {loading ? (
          <p>Checking your access...</p>
        ) : result?.error ? (
          <>
            <p>{result.error}</p>
            <p className="muted">Make sure you logged in with the same Cognito user or email that the owner allowed.</p>
          </>
        ) : (
          <>
            <p>You are authenticated and authorized to access this file.</p>
            <button onClick={() => window.open(result.downloadUrl, '_blank')}>Open File</button>
            <p className="muted">This S3 link is temporary and expires automatically.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default SharedFilePage;
