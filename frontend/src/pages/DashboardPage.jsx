import { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { apiRequest } from '../services/api';

function DashboardPage({ auth }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/files', { method: 'GET' }, auth);
      setFiles(data.files || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (key) => {
    try {
      const data = await apiRequest(`/files/download-url?key=${encodeURIComponent(key)}`, { method: 'GET' }, auth);
      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (key) => {
    try {
      await apiRequest('/files', { method: 'DELETE', body: JSON.stringify({ key }) }, auth);
      fetchFiles();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleShare = async (fileId, allowedUser) => {
    if (!allowedUser.trim()) {
      alert('Enter the allowed user sub or email first');
      return;
    }

    try {
      const data = await apiRequest(
        '/files/share',
        {
          method: 'POST',
          body: JSON.stringify({ fileId, allowedUsers: [allowedUser.trim()], expiresInHours: 24 }),
        },
        auth
      );
      await navigator.clipboard.writeText(data.shareLink);
      alert(`Protected share link copied:\n${data.shareLink}`);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="container">
      <header className="topbar">
        <div>
          <h1>Cloud File Storage Dashboard</h1>
          <p className="muted">Upload files to private S3, then create a protected link that requires authentication.</p>
        </div>
        <button onClick={auth.logout}>Logout</button>
      </header>

      <div className="grid two-col">
        <FileUpload auth={auth} onUploadComplete={fetchFiles} />

        <div className="card">
          <h3>User Info</h3>
          <p><strong>User:</strong> {auth.userSub || 'Cognito token user'}</p>
          <p><strong>Email:</strong> {auth.userEmail || 'Not set'}</p>
          <p className="muted">Shared users must login first. The backend only returns a temporary S3 URL after it confirms the authenticated user is allowed for that share.</p>
        </div>
      </div>

      <FileList files={files} onDownload={handleDownload} onDelete={handleDelete} onShare={handleShare} loading={loading} />
    </div>
  );
}

export default DashboardPage;
