import { useEffect, useRef, useState } from "react";
import API from "../../services/api";
import "./History.css";

import { exportPDF } from "../../utils/exportPDF";
import { exportCSV } from "../../utils/exportCSV";
import { toast } from "react-toastify";
import {
  FaDownload,
  FaFileCsv,
  FaSearch,
  FaTrash,
  FaClock,
  FaInbox,
  FaBookmark,
} from "react-icons/fa";

function History({ history, setHistory, loading = false }) {
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [savedIds, setSavedIds] = useState(() => JSON.parse(localStorage.getItem("savedPredictions") || "[]"));
  const searchInputRef = useRef(null);

  const toggleSaved = (id) => {
    const key = String(id);
    const nextIds = savedIds.includes(key)
      ? savedIds.filter((savedId) => savedId !== key)
      : [...savedIds, key];
    setSavedIds(nextIds);
    localStorage.setItem("savedPredictions", JSON.stringify(nextIds));
    toast.success(savedIds.includes(key) ? "Removed from saved predictions." : "Prediction saved.");
  };

  useEffect(() => {
    const handleShortcut = (event) => {
      const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (isSearchShortcut || (!isTyping && event.key === "/")) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearch("");
        searchInputRef.current.blur();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // ==========================================
  // FILTER HISTORY
  // ==========================================

  useEffect(() => {
    let data = [...history];

    if (search.trim() !== "") {
      const searchText = search.toLowerCase().trim();

      data = data.filter((item) =>
        item.news?.toLowerCase().includes(searchText)
      );
    }

    if (filter !== "All") {
      data = data.filter(
        (item) => item.prediction === filter
      );
    }

    setFilteredHistory(data);
  }, [history, search, filter]);

  // ==========================================
  // CLEAR HISTORY
  // ==========================================

  const clearHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all prediction history?"
      )
    ) {
      return;
    }

    try {
      await API.delete("clear-history/");

      setHistory([]);

      toast.success(
        "History cleared successfully!"
      );
    } catch (error) {
      console.error("Clear History Error:", error);

      toast.error(
        "Failed to clear prediction history."
      );
    }
  };

  // ==========================================
  // DELETE SINGLE RECORD
  // ==========================================

  const deleteHistory = async (id) => {
    if (!window.confirm("Delete this prediction?")) {
      return;
    }

    const deletedItem = history.find((item) => item.id === id);
    if (!deletedItem) return;

    try {
      await API.delete(`history/${id}/`);
      setHistory((current) => current.filter((item) => item.id !== id));

      toast.info(({ closeToast }) => (
        <div className="history-toast-content">
          <span>Prediction deleted.</span>
          <button
            type="button"
            onClick={async () => {
              try {
                await API.post("history/restore/", deletedItem);
                setHistory((current) =>
                  current.some((item) => item.id === deletedItem.id)
                    ? current
                    : [...current, deletedItem].sort((a, b) =>
                        new Date(b.created_at) - new Date(a.created_at)
                      )
                );
                toast.success("Prediction restored.");
              } catch (error) {
                console.error("Restore History Error:", error);
                toast.error("Unable to restore prediction.");
              } finally {
                closeToast();
              }
            }}
          >
            Undo
          </button>
        </div>
      ), { autoClose: 6000, closeOnClick: false });
    } catch (error) {
      console.error("Delete History Error:", error);
      toast.error("Unable to delete prediction. Please try again.");
    }
  };

  // ==========================================
  // EXPORT PDF
  // ==========================================

  const handleExportPDF = () => {
    if (filteredHistory.length === 0) {
      toast.warning(
        "No prediction data available to export."
      );
      return;
    }

    exportPDF(filteredHistory);

    toast.success(
      "PDF exported successfully!"
    );
  };

  // ==========================================
  // EXPORT CSV
  // ==========================================

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      toast.warning(
        "No prediction data available to export."
      );
      return;
    }

    exportCSV(filteredHistory);

    toast.success(
      "CSV exported successfully!"
    );
  };

  // ==========================================
  // SCORE FORMAT
  // ==========================================

  const formatScore = (score) => {
    if (score === null || score === undefined) {
      return "N/A";
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      return score;
    }

    return numericScore.toFixed(4);
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <section
      className="history"
      id="history"
    >
      <div className="history-wrapper">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="history-header">

          <div className="history-title">

            <h2>
              Prediction History
            </h2>

            <p>
              Review, search and manage your
              previous fake news predictions.
            </p>

          </div>

          {history.length > 0 && (
            <button
              className="clear-btn"
              type="button"
              onClick={clearHistory}
              aria-label="Clear all prediction history"
            >
              <FaTrash /> Clear history
            </button>
          )}

        </div>

        {/* ======================================
            CONTROLS
        ====================================== */}

        <div className="history-controls">

          {/* Search */}

          <div className="history-search">

            <span className="search-icon">
              <FaSearch />
            </span>

            <input
              ref={searchInputRef}
              type="search"
              aria-label="Search prediction history"
              placeholder="Search prediction history (Ctrl+K or /)..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                className="search-clear"
                onClick={() => setSearch("")}
                type="button"
                aria-label="Clear history search"
                title="Clear search (Esc)"
              >
                ×
              </button>
            )}

          </div>

          {/* Filter */}

          <select
            className="history-filter"
            aria-label="Filter prediction history"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >
            <option value="All">
              All Predictions
            </option>

            <option value="Real">
              🟢 Real News
            </option>

            <option value="Fake">
              🔴 Fake News
            </option>
          </select>

        </div>

        {/* ======================================
            EXPORT BUTTONS
        ====================================== */}

        <div className="history-actions">

          <div className="history-result-count">

            Showing{" "}
            <strong>
              {filteredHistory.length}
            </strong>{" "}
            of{" "}
            <strong>
              {history.length}
            </strong>{" "}
            predictions

          </div>

          <div className="export-buttons">

            <button
              className="pdf-btn"
              type="button"
              onClick={handleExportPDF}
              aria-label="Export filtered history as PDF"
            >
              <FaDownload /> Export PDF
            </button>

            <button
              className="csv-btn"
              type="button"
              onClick={handleExportCSV}
              aria-label="Export filtered history as CSV"
            >
              <FaFileCsv /> Export CSV
            </button>

          </div>

        </div>

        {/* ======================================
            EMPTY STATE
        ====================================== */}

        {loading ? (
          <div className="history-skeleton-list" role="status" aria-label="Loading prediction history">
            {[1, 2, 3].map((item) => (
              <div className="history-skeleton-card" key={item} aria-hidden="true">
                <div className="skeleton-line skeleton-badge" />
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-text" />
                <div className="skeleton-line skeleton-footer" />
              </div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (

          <div className="empty-history">

            <div className="empty-icon">
              <FaInbox />
            </div>

            <h3>
              No Prediction History Found
            </h3>

            <p>
              {history.length === 0
                ? "Your prediction results will appear here after you analyze some news."
                : "Try changing your search or filter."}
            </p>

          </div>

        ) : (

          /* ====================================
             HISTORY LIST
          ==================================== */

          <div className="history-list">

            {filteredHistory.map((item) => {

              const isReal =
                item.prediction === "Real";

              return (
                <article
                  className={`history-card ${
                    isReal
                      ? "history-real"
                      : "history-fake"
                  }`}
                  key={item.id}
                >

                  {/* ==============================
                      CARD HEADER
                  ============================== */}

                  <div className="history-card-header">

                    <div
                      className={`prediction-badge ${
                        isReal
                          ? "real-badge"
                          : "fake-badge"
                      }`}
                    >
                      {isReal
                        ? "🟢 REAL NEWS"
                        : "🔴 FAKE NEWS"}
                    </div>

                    <span className="history-date">
                      <FaClock />{" "}
                      {formatDate(
                        item.created_at
                      )}
                    </span>

                  </div>

                  {/* ==============================
                      NEWS CONTENT
                  ============================== */}

                  <div className="news-content">

                    <p className="news-text">
                      {item.news}
                    </p>

                    {item.source_url && (
                      <a
                        className="history-source-link"
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View submitted source
                      </a>
                    )}

                  </div>

                  {/* ==============================
                      CARD FOOTER
                  ============================== */}

                  <div className="history-footer">

                    <div className="score-container">

                      <span className="score-label">
                        Confidence Score
                      </span>

                      <span
                        className={`score-badge ${
                          isReal
                            ? "real-score"
                            : "fake-score"
                        }`}
                      >
                        {formatScore(
                          item.score
                        )}
                      </span>

                    </div>

                    <button
                      className={`history-save-btn ${savedIds.includes(String(item.id)) ? "saved" : ""}`}
                      type="button"
                      onClick={() => toggleSaved(item.id)}
                      title={savedIds.includes(String(item.id)) ? "Remove bookmark" : "Save prediction"}
                    >
                      <FaBookmark /> {savedIds.includes(String(item.id)) ? "Saved" : "Save"}
                    </button>
                    <button
                      className="delete-btn"
                      type="button"
                      aria-label={`Delete prediction from ${formatDate(item.created_at)}`}
                      title="Delete prediction"
                      onClick={() =>
                        deleteHistory(
                          item.id
                        )
                      }
                    >
                      <FaTrash /> Delete
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}

export default History;