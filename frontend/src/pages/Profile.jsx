import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser, FaUserCircle } from "react-icons/fa";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

import { useNavigate } from "react-router-dom";

import "./Profile.css";

function Profile() {
  const { updateUser, logout } = useAuth();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false,
  });

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
  });

  // ==========================================
  // Fetch Profile
  // ==========================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get("auth/profile/");

      setForm(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Handle Input Change
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // Save Profile
  // ==========================================

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await API.put("auth/profile/", form);

      updateUser({
        username: form.username,
        name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
      });

      toast.success(response.data.message || "Profile updated successfully.");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await API.post("auth/change-password/", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      toast.success(response.data.message || "Password changed successfully.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      const data = error.response?.data;
      const message = data?.errors?.join(" ") || data?.message || "Unable to change password.";
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="profile-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  // ==========================================
  // Profile Page
  // ==========================================

  const fullName = `${form.first_name} ${form.last_name}`.trim() || "Your Profile";
  const initials = `${form.first_name?.[0] || ""}${form.last_name?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="profile-page">
      <main className="profile-shell">
        <aside className="profile-summary">
          <div className="profile-summary-glow" />
          <div className="profile-avatar">{initials}</div>
          <div className="profile-summary-copy">
            <span className="profile-kicker">Personal account</span>
            <h1>{fullName}</h1>
            <p>@{form.username || "user"}</p>
          </div>
          <div className="profile-status">
            <span /> Profile active
          </div>
        </aside>

        <section className="profile-content">
          <button
            type="button"
            className="profile-back-link"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft /> Back to dashboard
          </button>

          <header className="profile-header">
            <span className="profile-header-icon"><FaUserCircle /></span>
            <div>
              <h2>Profile settings</h2>
              <p>Keep your personal details and account information up to date.</p>
            </div>
          </header>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-fields-grid">
              <div className="profile-field">
                <label htmlFor="first_name">First name</label>
                <div className="profile-input-wrap">
                  <FaUser />
                  <input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="last_name">Last name</label>
                <div className="profile-input-wrap">
                  <FaUser />
                  <input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>

            <div className="profile-fields-grid profile-account-grid">
              <div className="profile-field">
                <label htmlFor="username">Username</label>
                <div className="profile-input-wrap profile-input-disabled">
                  <FaUserCircle />
                  <input id="username" value={form.username || ""} disabled />
                  <span className="profile-lock">Locked</span>
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="email">Email address</label>
                <div className="profile-input-wrap">
                  <FaEnvelope />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button type="button" className="profile-secondary-btn" onClick={() => navigate("/")}>
                Cancel
              </button>
              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>

          <section className="password-section">
            <div className="password-section-heading">
              <span className="password-heading-icon"><FaLock /></span>
              <div>
                <h2>Change password</h2>
                <p>Use a strong password that you do not use elsewhere.</p>
              </div>
            </div>

            <form className="password-form" onSubmit={submitPasswordChange}>
              {["current_password", "new_password", "confirm_password"].map((field) => {
                const labels = {
                  current_password: "Current password",
                  new_password: "New password",
                  confirm_password: "Confirm new password",
                };

                return (
                  <div className="profile-field" key={field}>
                    <label htmlFor={field}>{labels[field]}</label>
                    <div className="profile-input-wrap password-input-wrap">
                      <FaLock />
                      <input
                        id={field}
                        name={field}
                        type={visiblePasswords[field] ? "text" : "password"}
                        value={passwordForm[field]}
                        onChange={handlePasswordChange}
                        placeholder={labels[field]}
                        autoComplete={field === "current_password" ? "current-password" : "new-password"}
                        required
                        minLength={field === "current_password" ? undefined : 8}
                      />
                      <button
                        type="button"
                        className="password-visibility-btn"
                        onClick={() => togglePasswordVisibility(field)}
                        aria-label={`${visiblePasswords[field] ? "Hide" : "Show"} ${labels[field]}`}
                      >
                        {visiblePasswords[field] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="password-actions">
                <button type="submit" className="profile-save-btn" disabled={changingPassword}>
                  {changingPassword ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Profile;