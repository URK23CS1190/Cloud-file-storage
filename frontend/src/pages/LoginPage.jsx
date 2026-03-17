import { useState } from 'react';

function LoginPage({ auth, title = 'Login' }) {
  const [token, setToken] = useState('');
  const [userSub, setUserSub] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token && !userSub) {
      alert('Enter a Cognito token or a demo user sub');
      return;
    }
    auth.login(token, userSub, userEmail);
  };

  return (
    <div className="container center-screen">
      <div className="card auth-card">
        <h1>{title}</h1>
        <p className="muted">
          For production, connect this page to Amazon Cognito Hosted UI or Amplify Auth.
          For local demo mode, enter a demo user sub and email.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Cognito Access Token (optional in demo mode)
            <textarea
              rows="6"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste Cognito access token"
            />
          </label>

          <label>
            User Sub / User ID
            <input
              type="text"
              value={userSub}
              onChange={(e) => setUserSub(e.target.value)}
              placeholder="Example: user-a"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </label>

          <button type="submit">Authenticate</button>
        </form>

        <div className="note-box">
          <strong>Secure share flow:</strong> when someone opens a shared link, they must authenticate first. The backend then checks whether their Cognito identity is allowed before it gives a temporary S3 download URL.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
