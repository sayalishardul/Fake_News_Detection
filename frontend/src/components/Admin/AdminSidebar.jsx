import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import {
  FaChartLine,
  FaUsers,
  FaNewspaper,
  FaChartPie,
  FaGear,
  FaRightFromBracket,
  FaShieldHalved,
} from "react-icons/fa6";

import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <FaChartLine />,
      label: "Dashboard",
    },
    {
      path: "/admin/users",
      icon: <FaUsers />,
      label: "Users",
    },
    {
      path: "/admin/predictions",
      icon: <FaNewspaper />,
      label: "Predictions",
    },
    {
      path: "/admin/analytics",
      icon: <FaChartPie />,
      label: "Analytics",
    },
    {
      path: "/admin/settings",
      icon: <FaGear />,
      label: "Settings",
    },
  ];

  return (
    <aside className="admin-sidebar">

      {/* ==========================================
          SIDEBAR HEADER
      ========================================== */}

      <div className="sidebar-header">
        <div className="sidebar-brand-mark"><FaShieldHalved /></div>
        <div>
          <h2>Admin Panel</h2>
          <p>Management Console</p>
        </div>
      </div>
      <div className="sidebar-section-label">Main menu</div>

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      <nav className="sidebar-navigation">

        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>

              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span className="sidebar-label">
                  {item.label}
                </span>
              </NavLink>

            </li>
          ))}
        </ul>

      </nav>

      <button className="sidebar-logout-btn" type="button" onClick={handleLogout}>
        <span className="sidebar-icon"><FaRightFromBracket /></span>
        <span className="sidebar-label">Logout</span>
      </button>

    </aside>
  );
}

export default AdminSidebar;