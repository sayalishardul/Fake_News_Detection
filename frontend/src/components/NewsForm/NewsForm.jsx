import { useState } from "react";
import {
  FaSearch,
  FaNewspaper,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

import API from "../../services/api";
import Loader from "../Loader/Loader";

import "./NewsForm.css";

const VERDICT_CONFIG = {
  supported: {
    label: "Real News",
    icon: FaCheckCircle,
    className: "supported",
  },
  contradicted: {
    label: "Fake News",
    icon: FaTimesCircle,
    className: "contradicted",
  },
  mixed: {
    label: "Mixed Evidence",
    icon: FaExclamationTriangle,
    className: "mixed",
  },
  inconclusive: {
    label: "Inconclusive",
    icon: FaQuestionCircle,
    className: "inconclusive",
  },
};

function NewsForm({ fetchHistory }) {
  const [news, setNews] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [verification, setVerification] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const handleNewsChange = (event) => {
    setNews(event.target.value);
    setVerification(null);
    setVerificationError("");
  };

  // Verify news using live web evidence, not the training dataset.
  const handleDetectNews = async () => {
    const newsText = news.trim();

    if (!newsText) {
      toast.warning("Please enter a news article or headline.");
      return;
    }

    setVerificationLoading(true);
    setVerification(null);
    setVerificationError("");

    try {
      const response = await API.post("verify-news/", {
        news: newsText,
        source_url: sourceUrl.trim(),
      });

      const data = response.data;
      setVerification(data);

      toast.success("News verification completed.");

      // Refresh history only if this endpoint saves verification records.
      if (typeof fetchHistory === "function") {
        try {
          await fetchHistory();
        } catch (historyError) {
          console.error("Unable to refresh history:", historyError);
        }
      }
    } catch (error) {
      console.error("News verification error:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Unable to verify this news. Please try again.";

      setVerificationError(message);
      toast.error(message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleClear = () => {
    setNews("");
    setSourceUrl("");
    setVerification(null);
    setVerificationError("");
  };

  const sources = Array.isArray(verification?.sources)
    ? verification.sources
    : [];

  const evidence = Array.isArray(verification?.evidence)
    ? verification.evidence
    : [];

  const checks = Array.isArray(verification?.checks)
    ? verification.checks
    : [];

  const sourcesById = Object.fromEntries(
    sources.map((source) => [source.id, source])
  );

  const status = verification?.status || "inconclusive";
  const verdictConfig =
    VERDICT_CONFIG[status] || VERDICT_CONFIG.inconclusive;

  const VerdictIcon = verdictConfig.icon;

  // Prefer counts returned by Django. Fall back to evidence relationships.
  const supportingCount =
    Number.isFinite(Number(verification?.supporting_sources_count))
      ? Number(verification.supporting_sources_count)
      : evidence.filter((item) =>
          ["supports", "supporting", "supported"].includes(
            String(item.relationship).toLowerCase()
          )
        ).length;

  const contradictingCount =
    Number.isFinite(Number(verification?.contradicting_sources_count))
      ? Number(verification.contradicting_sources_count)
      : evidence.filter((item) =>
          ["contradicts", "contradicting", "contradicted"].includes(
            String(item.relationship).toLowerCase()
          )
        ).length;

  const totalSources =
    Number.isFinite(Number(verification?.total_sources_count))
      ? Number(verification.total_sources_count)
      : sources.length;

  const evidenceTotal = supportingCount + contradictingCount;
  const supportingConfidence = evidenceTotal === 0
    ? 0
    : Math.round((supportingCount / evidenceTotal) * 100);
  const contradictingConfidence = evidenceTotal === 0
    ? 0
    : 100 - supportingConfidence;
  const verificationStrength = totalSources === 0
    ? "No sources found"
    : totalSources >= 5
      ? "Strong source coverage"
      : "Limited source coverage";

  return (
    <section className="news-wrapper">
      <div className="news-card">
        {/* Header */}
        <div className="news-header">
          <div className="news-icon">
            <FaNewspaper />
          </div>

          <div>
            <h2>Worldwide News Verification</h2>
            <p>
              Verify a news headline or article using live web search
              and evidence from relevant public sources.
            </p>
          </div>
        </div>

        {/* Information bar */}
        <div className="news-info">
          <div className="info-item">
            <FaShieldAlt />
            <span>Evidence-Based Analysis</span>
          </div>

          <div className="info-item">
            <FaSearch />
            <span>Live Web Search</span>
          </div>
        </div>

        {/* News input */}
        <div className="news-input-section">
          <div className="input-label-row">
            <label htmlFor="news-input">News Article or Headline</label>
            <span>{news.length} / 12000 characters</span>
          </div>

          <textarea
            id="news-input"
            placeholder="Paste a news headline or article here..."
            value={news}
            onChange={handleNewsChange}
            disabled={verificationLoading}
            maxLength={12000}
          />

          <div className="source-url-field">
            <label htmlFor="source-url">News Source URL <span>(optional)</span></label>
            <input
              id="source-url"
              type="url"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://publisher.com/news-article"
              disabled={verificationLoading}
            />
          </div>
        </div>

        {/* Actions: one Detect News button, using live verification */}
        <div className="news-actions">
          <button
            type="button"
            className="detect-btn"
            onClick={handleDetectNews}
            disabled={verificationLoading || !news.trim()}
          >
            <FaSearch />
            {verificationLoading ? " Verifying News..." : " Detect News"}
          </button>

          {news && (
            <button
              type="button"
              className="clear-news-btn"
              onClick={handleClear}
              disabled={verificationLoading}
            >
              Clear
            </button>
          )}
        </div>

        {/* Loading */}
        {verificationLoading && (
          <div className="verification-loading" role="status">
            <Loader />
            <p>Searching public sources and assessing the evidence...</p>
            <p>
              Please wait while the web search and AI assessment complete.
            </p>
          </div>
        )}

        {/* Error */}
        {verificationError && (
          <p className="verification-error" role="alert">
            {verificationError}
          </p>
        )}

        {/* Verification result */}
        {!verificationLoading && verification && (
          <section className="verification-result" aria-live="polite">
            <div className="result-divider">
              <span>News Verification Result</span>
            </div>

            {/* Main verdict */}
            <div
              className={`verification-status ${verdictConfig.className}`}
              role="status"
            >
              <VerdictIcon />
              <span>{verdictConfig.label}</span>
            </div>

            {verification.claim && (
              <div className="verification-claim">
                <h3>Claim Checked</h3>
                <p>{verification.claim}</p>
              </div>
            )}

            {/* Source counts */}
            <div className="verification-counts">
              <div className="verification-count-card">
                <FaCheckCircle />
                <span className="count-number">{supportingCount}</span>
                <span className="count-label">Supporting Sources</span>
              </div>

              <div className="verification-count-card">
                <FaTimesCircle />
                <span className="count-number">{contradictingCount}</span>
                <span className="count-label">Contradicting Sources</span>
              </div>

              <div className="verification-count-card">
                <FaNewspaper />
                <span className="count-number">{totalSources}</span>
                <span className="count-label">Total Sources Found</span>
              </div>
            </div>

            {/* Verification strength */}
            <div className="verification-health">
              <div>
                <span>Verification status</span>
                <strong>{verificationStrength}</strong>
              </div>
              <span className={`verification-health-badge ${verdictConfig.className}`}>
                {verdictConfig.label}
              </span>
            </div>

            {/* Evidence confidence breakdown */}
            <div className="confidence-breakdown">
              <div className="confidence-heading">
                <h3>Evidence Confidence Breakdown</h3>
                <span>Based on source relationships</span>
              </div>

              <div className="confidence-row">
                <div className="confidence-label">
                  <span><i className="confidence-dot real" /> Supporting evidence</span>
                  <strong>{supportingConfidence}%</strong>
                </div>
                <div className="confidence-track">
                  <span className="confidence-fill real" style={{ width: `${supportingConfidence}%` }} />
                </div>
              </div>

              <div className="confidence-row">
                <div className="confidence-label">
                  <span><i className="confidence-dot fake" /> Contradicting evidence</span>
                  <strong>{contradictingConfidence}%</strong>
                </div>
                <div className="confidence-track">
                  <span className="confidence-fill fake" style={{ width: `${contradictingConfidence}%` }} />
                </div>
              </div>
            </div>

            {/* Assessment summary */}
            <div className="verification-summary">
              <h3>Assessment</h3>
              <p>
                {verification.summary ||
                  "No assessment explanation was returned."}
              </p>
            </div>

            {/* Evidence relationships */}
            {evidence.length > 0 && (
              <div className="verification-checks">
                <h3>Evidence Assessment</h3>

                <ul>
                  {evidence.map((item, index) => {
                    const source = sourcesById[item.source_id];
                    const relationship =
                      item.relationship || "unclear";

                    return (
                      <li key={`${item.source_id || "source"}-${index}`}>
                        <strong>
                          {relationship.charAt(0).toUpperCase() +
                            relationship.slice(1)}
                        </strong>

                        {source?.url && (
                          <>
                            {" "}
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {source.title || "Open source"}
                            </a>
                          </>
                        )}

                        {item.reason && <p>{item.reason}</p>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Recommended checks */}
            {checks.length > 0 && (
              <div className="verification-checks">
                <h3>Recommended Next Checks</h3>

                <ul>
                  {checks.map((check, index) => (
                    <li key={`${index}-${check}`}>{check}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources */}
            <div className="verification-sources">
              <h3>Sources Found ({sources.length})</h3>

              {sources.length > 0 ? (
                <ul>
                  {sources.map((source, index) => (
                    <li key={source.id || source.url || index}>
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.title || "Open source"}
                        </a>
                      ) : (
                        <strong>{source.title || "Untitled source"}</strong>
                      )}

                      {source.published_date && (
                        <span className="source-date">
                          {" "}({source.published_date})
                        </span>
                      )}

                      {source.snippet && <p>{source.snippet}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No usable sources were returned.</p>
              )}
            </div>

            <p className="verification-disclaimer">
              This is an AI-assisted assessment of the retrieved sources,
              not a guarantee of truth. Search results may be incomplete,
              and a source mentioning the same topic does not necessarily
              support or contradict the claim.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}

export default NewsForm;
