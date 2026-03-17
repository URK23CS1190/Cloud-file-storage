import { useMemo, useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SharedFilePage from './pages/SharedFilePage';

function getRoute() {
  const path = window.location.pathname;
  const match = path.match(/^\/shared\/([^/]+)$/);
  return match ? { type: 'shared', shareId: match[1] } : { type: 'dashboard' };
}

function App() {
  const route = getRoute();
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userSub, setUserSub] = useState(localStorage.getItem('userSub') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');

  const auth = useMemo(
    () => ({
      token,
      userSub,
      userEmail,
      login: (newToken, newUserSub, newUserEmail) => {
        localStorage.setItem('token', newToken || '');
        localStorage.setItem('userSub', newUserSub || '');
        localStorage.setItem('userEmail', newUserEmail || '');
        setToken(newToken || '');
        setUserSub(newUserSub || '');
        setUserEmail(newUserEmail || '');
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userSub');
        localStorage.removeItem('userEmail');
        setToken('');
        setUserSub('');
        setUserEmail('');
      },
      isAuthenticated: Boolean(token || userSub),
    }),
    [token, userSub, userEmail]
  );

  if (route.type === 'shared') {
    return auth.isAuthenticated ? (
      <SharedFilePage auth={auth} shareId={route.shareId} />
    ) : (
      <LoginPage auth={auth} title="Authenticate to open shared file" />
    );
  }

  return auth.isAuthenticated ? (
    <DashboardPage auth={auth} />
  ) : (
    <LoginPage auth={auth} title="Login to Cloud File Storage" />
  );
}

export default App;
