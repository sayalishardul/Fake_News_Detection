import { Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import "./Footer.css";

function Footer({ copyrightOnly = false }) {
  if (copyrightOnly) {
    return (
      <footer className="site-footer admin-copyright-footer">
        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} Fake News Detector. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="site-footer-content">
        <div className="site-footer-brand">
          <div className="site-footer-logo"><FaShieldAlt /></div>
          <div>
            <h2>Fake News Detector</h2>
            <p>Helping users analyse news and make informed decisions with AI-assisted verification.</p>
          </div>
        </div>

        <div className="site-footer-links">
          <div>
            <h3>Explore</h3>
            <Link to="/about">About Us</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/fact-checking-guide">Fact-Checking Guide</Link>
          </div>
          <div>
            <h3>Support</h3>
            <Link to="/help">Help & FAQ</Link>
            <Link to="/contact">Contact Support</Link>
            <Link to="/sources">News Sources</Link>
          </div>
          <div>
            <h3>Account</h3>
            <Link to="/statistics">My Statistics</Link>
            <Link to="/saved">Saved Predictions</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        <p>© {new Date().getFullYear()} Fake News Detector. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
