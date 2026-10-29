import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/Admin/AdminSidebar";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../context/AuthContext";

import "./AdminSettings.css";

import API from "../services/api";
import { toast } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaUserShield,
  FaSignOutAlt,
  FaLock,
} from "react-icons/fa";

function AdminSettings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    username: "",
    name: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await API.get("auth/profile/");
        setProfileForm({
          username: response.data.username || "",
          name: response.data.name || "",
          email: response.data.email || "",
        });
      } catch (error) {
        toast.error("Unable to load profile information.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = (event) => {
    setProfileForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  // ==========================================
  // PASSWORD STATES
  // ==========================================

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const passwordStrength = (() => {
    if (!newPassword) return { score: 0, label: "Not set" };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    return {
      score,
      label: ["Weak", "Weak", "Fair", "Good", "Strong"][score],
    };
  })();

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword = async (e) => {
  e.preventDefault();

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    toast.error("Please fill in all password fields.");
    return;
  }

  if (newPassword.length < 8) {
    toast.error("New password must contain at least 8 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("New password and confirm password do not match.");
    return;
  }

  if (currentPassword === newPassword) {
    toast.error("New password must be different from the current password.");
    return;
  }

  try {
    setPasswordLoading(true);

    const response = await API.post(
      "admin/change-password/",
      {
        current_password: currentPassword,
        new_password: newPassword,
      }
    );

    toast.success(
      response.data.message ||
        "Password changed successfully."
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

  } catch (error) {
    console.error(
      "Change Password Error:",
      error
    );

    toast.error(
      error.response?.data?.error ||
        "Unable to change password."
    );

  } finally {
    setPasswordLoading(false);
  }
};

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!profileForm.username.trim() || !profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Username, name, and email are required.");
      return;
    }

    const nameParts = profileForm.name.trim().split(/\s+/);
    const first_name = nameParts.shift() || "";
    const last_name = nameParts.join(" ");

    try {
      setProfileSaving(true);
      const response = await API.put("auth/profile/", {
        username: profileForm.username.trim(),
        first_name,
        last_name,
        email: profileForm.email.trim(),
      });
      const savedUser = response.data.user;
      const savedName = `${savedUser.first_name || ""} ${savedUser.last_name || ""}`.trim();
      updateUser({
        username: savedUser.username,
        name: savedName,
        email: savedUser.email,
      });
      setProfileForm((current) => ({ ...current, name: savedName }));
      toast.success("Admin profile updated successfully.");
    } catch (error) {
      const data = error.response?.data;
      const message = data?.username?.[0] || data?.email?.[0] || data?.detail || "Unable to update admin profile.";
      toast.error(message);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <>
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content profile-settings-page">
        <div className="profile-shell admin-profile-shell">
          <aside className="profile-summary admin-profile-summary-panel">
            <div className="profile-avatar admin-avatar">
              {(user?.username || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-summary-copy">
              <span className="profile-kicker">Administrator account</span>
              <h1>{user?.name || user?.username || "Administrator"}</h1>
              <p>@{user?.username || "admin"}</p>
            </div>
            <div className="profile-status"><span /> Account active</div>
          </aside>

          <div className="profile-content admin-profile-content">
            <div className="settings-header profile-header">
              <span className="profile-header-icon"><FaUserShield /></span>
              <div>
                <h1>Admin settings</h1>
                <p>Manage your administrator profile, security, and session.</p>
              </div>
            </div>

        {/* ==========================================
            ADMIN PROFILE
        ========================================== */}

        <div className="settings-card profile-settings-card">
          <div className="settings-card-header">

            <h2>Admin Profile</h2>

            <p>
              Your current account information
            </p>

          </div>

          <form className="settings-form admin-edit-profile-form" onSubmit={handleSaveProfile}>
            <div className="settings-field">
              <label htmlFor="admin-profile-username">Username</label>
              <input
                id="admin-profile-username"
                name="username"
                type="text"
                value={profileForm.username}
                onChange={handleProfileChange}
                disabled={profileLoading || profileSaving}
                autoComplete="username"
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="admin-profile-name">Name</label>
              <input
                id="admin-profile-name"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
                disabled={profileLoading || profileSaving}
                autoComplete="name"
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="admin-profile-email">Email</label>
              <input
                id="admin-profile-email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                disabled={profileLoading || profileSaving}
                autoComplete="email"
                required
              />
            </div>

            <div className="admin-profile-form-actions">
              <button type="submit" className="profile-save-btn" disabled={profileLoading || profileSaving}>
                {profileSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>

        </div>

        {/* ==========================================
            PASSWORD
        ========================================== */}

        <section className="settings-card password-section admin-password-section">
          <div className="password-section-heading admin-password-heading">
            <span className="password-heading-icon"><FaLock /></span>
            <div>
              <h2>Change password</h2>
              <p>Use a strong password that you do not use elsewhere.</p>
            </div>
          </div>

          <form
            className="password-form admin-password-form"
            onSubmit={handleChangePassword}
          >

            <div className="profile-field admin-current-password-field">
              <label htmlFor="admin-current-password">Current password</label>
              <div className="profile-input-wrap password-input-wrap">
                <FaLock />
                <input
                  id="admin-current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-visibility-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={`${showCurrentPassword ? "Hide" : "Show"} current password`}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="admin-new-password">New password</label>
              <div className="profile-input-wrap password-input-wrap">
                <FaLock />
                <input
                  id="admin-new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-visibility-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={`${showNewPassword ? "Hide" : "Show"} new password`}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {newPassword && (
                <div className={`password-strength strength-${passwordStrength.score}`} aria-live="polite">
                  <div className="strength-bars" aria-hidden="true">
                    {[1, 2, 3, 4].map((bar) => <span key={bar} className={bar <= passwordStrength.score ? "active" : ""} />)}
                  </div>
                  <span>{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="admin-confirm-password">Confirm new password</label>
              <div className="profile-input-wrap password-input-wrap">
                <FaLock />
                <input
                  id="admin-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-visibility-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={`${showConfirmPassword ? "Hide" : "Show"} confirmation password`}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="password-actions">
              <button
                type="submit"
                className="profile-save-btn admin-save-password-btn"
                disabled={passwordLoading}
              >
                <FaLock />
                {passwordLoading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </section>

        {/* ==========================================
            ACCOUNT
        ========================================== */}

        <div className="settings-card account-card">

          <div className="settings-card-header">

            <h2>Account</h2>

            <p>
              Manage your admin session
            </p>

          </div>

          <div className="account-actions">
            <div>
              <strong>Sign out of this device</strong>
              <p>You will need to sign in again to access the admin panel.</p>
            </div>
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>

        </div>

          </div>
        </div>
      </main>
    </div>
    <Footer copyrightOnly />
    </>
  );
}

export default AdminSettings;