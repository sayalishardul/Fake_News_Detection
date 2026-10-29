import "./DashboardCard.css";

function DashboardCard({ title, value, color, icon: Icon, subtitle }) {
  return (
    <div
      className="dashboard-card"
      style={{
        borderTop: `5px solid ${color}`,
      }}
    >
      <div className="card-header">
        <div className="card-info">
          <p className="dashboard-card-title">{title}</p>
          <h2 className="dashboard-card-value">{value}</h2>
          {subtitle && <span className="dashboard-card-subtitle">{subtitle}</span>}
        </div>

        <div
          className="dashboard-icon"
          style={{
            color: color,
          }}
        >
          {Icon && <Icon />}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;