import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaNewspaper, FaUser } from "react-icons/fa";

import API from "../services/api";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(emptyForm);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const response = await API.post("auth/register/", {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      toast.success(response.data.message);

      navigate("/login");
    } catch (error) {
      console.log(error);

      if (error.response) {
        toast.error("Registration Failed");
      } else {
        toast.error("Unable to connect to server");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <section className="register-card" aria-labelledby="register-title">
        <div className="auth-brand">
          <span className="auth-brand-icon"><FaNewspaper /></span>
          <div>
            <strong>Fake News Detector</strong>
            <span>AI-powered news verification</span>
          </div>
        </div>

        <div className="auth-heading register-heading">
          <h2 id="register-title">Create your account</h2>
          <p>Join to analyse articles and save prediction history.</p>
        </div>

        <form onSubmit={handleRegister} autoComplete="off">
          <div className="register-name-grid">
            <div>
              <label className="auth-field-label" htmlFor="register-first-name">First name</label>
              <div className="auth-input-wrap"><FaUser /><input id="register-first-name" type="text" name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} autoComplete="off" readOnly onFocus={(event) => event.currentTarget.removeAttribute("readOnly")} required /></div>
            </div>
            <div>
              <label className="auth-field-label" htmlFor="register-last-name">Last name</label>
              <div className="auth-input-wrap"><FaUser /><input id="register-last-name" type="text" name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} autoComplete="off" readOnly onFocus={(event) => event.currentTarget.removeAttribute("readOnly")} required /></div>
            </div>
          </div>

          <label className="auth-field-label" htmlFor="register-username">Username</label>
          <div className="auth-input-wrap"><FaUser /><input id="register-username" type="text" name="username" placeholder="Choose a username" value={form.username} onChange={handleChange}           autoComplete="off" readOnly onFocus={(event) => event.currentTarget.removeAttribute("readOnly")} required /></div>

          <label className="auth-field-label" htmlFor="register-email">Email address</label>
          <div className="auth-input-wrap"><FaEnvelope /><input id="register-email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange}           autoComplete="off" readOnly onFocus={(event) => event.currentTarget.removeAttribute("readOnly")} required /></div>

          <label className="auth-field-label" htmlFor="register-password">Password</label>
          <div className="password-input-wrapper auth-input-wrap"><FaLock /><input id="register-password" type={showPassword ? "text" : "password"} name="password" placeholder="Create a password" value={form.password} onChange={handleChange} autoComplete="new-password" readOnly onFocus={(event) => event.currentTarget.removeAttribute("readOnly")} minLength={8} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div>

          <label className="auth-field-label" htmlFor="register-confirm-password">Confirm password</label>
          <div className="password-input-wrapper auth-input-wrap"><FaLock /><input id="register-confirm-password" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" readOnly onFocus={(event) => event.currentTarget.removeAttribute("readOnly")} minLength={8} required /><button className="password-toggle" type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button></div>

          <button className="auth-submit-btn" type="submit" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </div>
  );
}

export default Register;