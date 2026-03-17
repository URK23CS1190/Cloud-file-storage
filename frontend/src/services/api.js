const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function buildHeaders(token = '', userSub = '', userEmail = '', extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!token && userSub ? { 'x-demo-user-sub': userSub } : {}),
    ...(!token && userEmail ? { 'x-demo-user-email': userEmail } : {}),
    ...extra,
  };
}

export const apiRequest = async (path, options = {}, auth = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(auth.token, auth.userSub, auth.userEmail, options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const uploadFileToS3 = async (uploadUrl, file) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!response.ok) throw new Error('Upload failed');
  return true;
};
