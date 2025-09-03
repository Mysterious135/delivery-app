import React from 'react'; // Removed unused useState
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import './layout-styles.css'; // Use the correct CSS file name

function App() {
  // We manage the login state by simply checking for the token's existence
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // This function will be called from the Login component to force a re-render
  const handleLoginSuccess = () => {
    navigate('/'); // Navigate to home page
    window.location.reload(); // Force a refresh to update the nav bar
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload(); // Force a refresh
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav className="app-nav">
          <div className="nav-brand">
            <Link to="/">Food Delivery App</Link>
          </div>
          <div className="nav-links">
            {!token ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="logout-button">Logout</button>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Routes>
          {/* If the user has a token, show HomePage. Otherwise, redirect to Login. */}
          <Route path="/" element={token ? <HomePage /> : <Login onLoginSuccess={handleLoginSuccess}/>} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
