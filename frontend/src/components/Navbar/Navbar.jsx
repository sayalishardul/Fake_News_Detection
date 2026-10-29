import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBookOpen, FaChartPie, FaChevronDown, FaHome, FaNewspaper, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();

    toast.success("Logged out successfully!");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link className="navbar-logo" to="/" aria-label="Fake News Detector home">
        <span className="navbar-logo-icon" aria-hidden="true">
          <FaNewspaper />
        </span>
        <span>Fake News Detector</span>
      </Link>

      <div className="navbar-links">
        <Link className="navbar-link active" to="/">
          <FaHome />
          <span>Home</span>
        </Link>

        <Link className="navbar-link" to="/statistics">
          <FaChartPie />
          <span>Statistics</span>
        </Link>

        <details className="navbar-discover">
          <summary><FaBookOpen /><span>Explore</span><FaChevronDown className="discover-chevron" /></summary>
          <div className="navbar-discover-menu">
            <Link to="/saved">Saved Predictions</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/fact-checking-guide">Fact-Checking Guide</Link>
            <Link to="/sources">News Sources</Link>
            <Link to="/help">Help & FAQ</Link>
            <Link to="/contact">Contact Support</Link>
            <Link to="/about">About Us</Link>
            <Link to="/privacy">Privacy & Terms</Link>
          </div>
        </details>

        <Link className="navbar-link" to="/profile">
          <FaUserCircle />
          <span>Profile</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="welcome-user">
          <span className="welcome-label">Welcome back</span>
          <strong>{user?.name || "User"}</strong>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          type="button"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;