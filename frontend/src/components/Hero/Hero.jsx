import { FaBolt, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />

      <div className="hero-content">
        <div className="hero-badge">
          <FaShieldAlt />
          AI-powered fact analysis
        </div>

        <h1>
          Detect misinformation.
          <span>Protect the truth.</span>
        </h1>

        <p className="hero-description">
          Analyze news articles with machine learning and understand whether
          a story is likely real or fake before you share it.
        </p>

        <div className="hero-highlights" aria-label="Detection features">
          <span><FaBolt /> Instant analysis</span>
          <span><FaCheckCircle /> Clear result</span>
          <span><FaShieldAlt /> Privacy focused</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;