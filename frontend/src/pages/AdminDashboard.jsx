import { useEffect, useState } from "react";

import API from "../services/api";

import AdminSidebar from "../components/Admin/AdminSidebar";
import DashboardCard from "../components/Admin/DashboardCard";
import AdminPieChart from "../components/Admin/AdminPieChart";
import RecentUsers from "../components/Admin/RecentUsers";
import Footer from "../components/Footer/Footer";

import "./AdminDashboard.css";

import {
  FaUsers,
  FaDatabase,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaChartLine,
  FaClock,
} from "react-icons/fa"; 


function AdminDashboard() {

  const [dashboard, setDashboard] = useState({
    total_users: 0,
    total_predictions: 0,
    real_news: 0,
    fake_news: 0,
    recent_predictions: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    fetchDashboard();
  }, []);


  const fetchDashboard = async () => {

    try {
      setError("");
      setRefreshing(true);
      const response = await API.get("admin/dashboard/");

      console.log("Dashboard Response:", response.data);

      setDashboard({
        total_users: response.data.total_users || 0,
        total_predictions: response.data.total_predictions || 0,
        real_news: response.data.real_news || 0,
        fake_news: response.data.fake_news || 0,
        recent_predictions: response.data.recent_predictions || [],
      });

    } catch (error) {

      console.error("Dashboard API Error:", error);
      setError("Dashboard data could not be loaded. Please try again.");

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response:", error.response.data);
      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  return (
    <>

      {/* =========================================
          ADMIN LAYOUT
      ========================================= */}

      <div className="admin-layout">

        <AdminSidebar />


        <div className="admin-content">
          <div className="admin-dashboard-heading">
            <div>
              <span className="admin-dashboard-eyebrow">Overview</span>
              <h1>Admin Dashboard</h1>
              <p>Monitor users, predictions, and classification activity.</p>
            </div>
            <div className="dashboard-heading-actions">
              <span className="dashboard-date"><FaClock /> {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
              <button type="button" className="dashboard-refresh-btn" onClick={fetchDashboard} disabled={refreshing}>
                <FaSyncAlt className={refreshing ? "is-spinning" : ""} />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>

          {error && <div className="dashboard-error" role="alert">{error}</div>}

          {/* =========================================
              DASHBOARD CARDS
          ========================================= */}

          <div className="dashboard-cards">

  <DashboardCard
  title="Total Users"
  value={loading ? "..." : dashboard.total_users}
  color="#7c3aed"
  icon={FaUsers}
  subtitle="Registered accounts"
/>

<DashboardCard
  title="Total Predictions"
  value={loading ? "..." : dashboard.total_predictions}
  color="#2563eb"
  icon={FaDatabase}
  subtitle="All analyses completed"
/>

<DashboardCard
  title="Real News"
  value={loading ? "..." : dashboard.real_news}
  color="#16a34a"
  icon={FaCheckCircle}
  subtitle="Verified authentic"
/>

<DashboardCard
  title="Fake News"
  value={loading ? "..." : dashboard.fake_news}
  color="#dc2626"
  icon={FaExclamationTriangle}
  subtitle="Detected as misleading"
/>

</div>


          <div className="dashboard-analytics-grid">
            <section className="dashboard-panel dashboard-chart-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Prediction Distribution</h2>
                  <p>Real and fake news classifications</p>
                </div>
                <FaChartLine className="dashboard-panel-icon" />
              </div>
              <AdminPieChart
                real={dashboard.real_news}
                fake={dashboard.fake_news}
              />
            </section>

            <section className="dashboard-panel recent-predictions-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Recent Predictions</h2>
                  <p>Latest news analysed by users</p>
                </div>
              </div>
              <div className="recent-predictions-list">
                {dashboard.recent_predictions.length === 0 ? (
                  <div className="dashboard-empty-state">No predictions have been recorded yet.</div>
                ) : dashboard.recent_predictions.map((prediction) => {
                  const label = String(prediction.prediction || "Unknown").toLowerCase();
                  const isReal = ["real", "real news", "supported"].includes(label);
                  return (
                    <div className="recent-prediction-row" key={prediction.id}>
                      <div className={`prediction-status-dot ${isReal ? "real" : "fake"}`} />
                      <div className="recent-prediction-copy">
                        <strong>{prediction.news || "Untitled prediction"}</strong>
                        <span>{prediction.created_at ? new Date(prediction.created_at).toLocaleString() : "Recently"}</span>
                      </div>
                      <span className={`prediction-pill ${isReal ? "real" : "fake"}`}>
                        {prediction.prediction}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* =========================================
              RECENT USERS
          ========================================= */}

          <RecentUsers />


        </div>

      </div>
      <Footer copyrightOnly />

    </>
  );
}


export default AdminDashboard;