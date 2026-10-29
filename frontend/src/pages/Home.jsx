import { useEffect, useState } from "react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Hero from "../components/Hero/Hero";
import NewsForm from "../components/NewsForm/NewsForm";
import History from "../components/History/History";
import PieChart from "../components/Charts/PieChart";
import StatsCard from "../components/StatsCard/StatsCard";
import PredictionLineChart from "../components/Charts/LineChart";
import NewsAssistant from "../components/Assistant/NewAssistant";
import { FaChartPie, FaHistory } from "react-icons/fa";

import API from "../services/api";
import "./Home.css";


function Home() {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // ==========================================
  // FETCH PREDICTION HISTORY
  // ==========================================

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await API.get("history/");

      setHistory(response.data);
    } catch (error) {
      console.error("History API Error:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response:", error.response.data);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  // ==========================================
  // LOAD HISTORY
  // ==========================================

  useEffect(() => {
    fetchHistory();
  }, []);

  // ==========================================
  // STATISTICS
  // ==========================================

  const total = history.length;

  const normalizedPrediction = (item) =>
    String(item.prediction || "").trim().toLowerCase();

  const real = history.filter((item) =>
    ["real", "real news", "supported"].includes(normalizedPrediction(item))
  ).length;

  const fake = history.filter((item) =>
    ["fake", "fake news", "contradicted"].includes(normalizedPrediction(item))
  ).length;

  const accuracy =
    total === 0
      ? 0
      : Math.round((real / total) * 100);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activityCount = (days) => {
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    return history.filter((item) => {
      const createdAt = new Date(item.created_at);
      return !Number.isNaN(createdAt.getTime()) && createdAt >= start;
    }).length;
  };

  const activity = [
    { label: "Today", value: activityCount(1) },
    { label: "Last 7 days", value: activityCount(7) },
    { label: "Last 30 days", value: activityCount(30) },
  ];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="home-page">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <Navbar />

      {/* ======================================
          HERO
      ====================================== */}

      <Hero />

      {/* ======================================
          DASHBOARD
      ====================================== */}

      <div className="dashboard-container">

        {/* ====================================
            STATISTICS
        ==================================== */}

        <section className="stats-section">

          <div className="section-heading">

            <div>

              <h3>
                Prediction Overview
              </h3>

              <p>
                Monitor your latest fake news detection
                statistics.
              </p>

            </div>

          </div>

          <div className="stats-grid">

            <StatsCard
              title="Total Predictions"
              value={total}
              color="#2563eb"
              icon="📄"
            />

            <StatsCard
              title="Real News"
              value={real}
              color="#22c55e"
              icon="🟢"
            />

            <StatsCard
              title="Fake News"
              value={fake}
              color="#ef4444"
              icon="🔴"
            />

            <StatsCard
              title="Accuracy"
              value={accuracy}
              color="#f59e0b"
              icon="🎯"
            />

          </div>

          <div className="activity-summary" aria-label="Recent prediction activity">
            <div className="activity-summary-heading">
              <span>Recent activity</span>
              <strong>Prediction volume</strong>
            </div>
            <div className="activity-summary-grid">
              {activity.map((period) => (
                <div className="activity-period" key={period.label}>
                  <strong>{period.value}</strong>
                  <span>{period.label}</span>
                </div>
              ))}
            </div>
          </div>

        </section>


        {/* ====================================
            NEWS PREDICTION
        ==================================== */}

        <section className="prediction-section">

          <div className="section-heading">

            <div>

              <h3>
                Check News
              </h3>

              <p>
                Enter a news article to determine
                whether it is likely to be real or fake.
              </p>

            </div>

            <span className="live-status">

              <span className="live-dot"></span>

              Detection Active

            </span>

          </div>

          <NewsForm
            fetchHistory={fetchHistory}
          />

        </section>


        {/* ====================================
            PREDICTION ANALYTICS
        ==================================== */}

        <section className="home-analytics-section">

          {/* ANALYTICS HEADING */}

          <div className="section-heading">

            <div>

              <h3 className="section-title-with-icon">
                <span><FaChartPie /></span>
                Prediction Analytics
              </h3>

              <p>
                Visualize your prediction results and
                activity over time.
              </p>

            </div>

          </div>


          {/* ANALYTICS CHARTS */}

          <div className="home-analytics-card">

            <div className="analytics-grid">

              {/* ==================================
                  PIE CHART
              ================================== */}

              <div className="analytics-chart">

                <PieChart
                  real={real}
                  fake={fake}
                />

              </div>


              {/* ==================================
                  LINE CHART
              ================================== */}

              <div className="analytics-chart">

                <PredictionLineChart
                  history={history}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ====================================
            PREDICTION HISTORY
        ==================================== */}

        <section className="history-section">

          <div className="section-heading">

            <div>

              <h3 className="section-title-with-icon">
                <span><FaHistory /></span>
                Prediction History
              </h3>

              <p>
                Review your previous news analysis
                results.
              </p>

            </div>

            <span className="history-count">

              {total}{" "}

              {total === 1
                ? "Prediction"
                : "Predictions"}

            </span>

          </div>

          <div className="history-card">

            <History
              history={history}
              setHistory={setHistory}
              loading={historyLoading}
            />

          </div>

        </section>

      </div>

      <NewsAssistant />
      <Footer />

    </div>
  );
}

export default Home;