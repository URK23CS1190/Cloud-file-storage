import React, { useEffect, useState } from "react";
import { list, getUrl, remove } from "aws-amplify/storage";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";

function DashboardPage({ auth }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);

      const result = await list({
        path: "public/",
      });

      setFiles(result.items || []);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (path) => {
    try {
      const result = await getUrl({
        path,
        options: {
          expiresIn: 3600,
        },
      });

      window.open(result.url.toString(), "_blank");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to open file");
    }
  };

  const handleDelete = async (path) => {
    try {
      await remove({
        path,
      });

      fetchFiles();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete file");
    }
  };

  const handleShare = async (path) => {
    try {
      const encodedPath = encodeURIComponent(path);
      const shareLink = `${window.location.origin}/shared/${encodedPath}`;
      await navigator.clipboard.writeText(shareLink);
      alert(`Share link copied:\n${shareLink}`);
    } catch (error) {
      console.error(error);
      alert("Failed to copy share link");
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
          <p className="muted">
            Upload files to S3 and open them from your deployed app.
          </p>
        </div>
        <button onClick={auth.logout}>Logout</button>
      </header>

      <div className="grid two-col">
        <FileUpload auth={auth} onUploadComplete={fetchFiles} />

        <div className="card">
          <h3>User Info</h3>
          <p><strong>User:</strong> {auth.userSub || "Authenticated user"}</p>
          <p><strong>Email:</strong> {auth.userEmail || "Not set"}</p>
          <p className="muted">
            Files are now read from Amplify Storage (S3), not from localhost.
          </p>
        </div>
      </div>

      <FileList
        files={files}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onShare={handleShare}
        loading={loading}
      />
    </div>
  );
}

export default DashboardPage;