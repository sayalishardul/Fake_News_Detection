import { FaNewspaper } from "react-icons/fa6";
import "./AdminNavbar.css";

function AdminNavbar(){

    return(

        <nav className="admin-navbar">

            <div className="admin-navbar-title" style={{ color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}>
                <FaNewspaper style={{ color: "#ffffff" }} />
                <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>Fake News Detector</span>
            </div>

        </nav>

    )

}

export default AdminNavbar;