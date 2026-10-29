import { useEffect, useState } from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { toast } from "react-toastify";

import { FaEye, FaEyeSlash, FaLock, FaNewspaper, FaUser } from "react-icons/fa";

import API from "../services/api";

import { useAuth } from "../context/AuthContext";

import "./Login.css";


function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();


  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({ username: "", password: "" });
  }, []);


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {

    setForm({
      ...form,

      [e.target.name]:
        e.target.value,
    });

  };


  // =========================================================
  // HANDLE LOGIN
  // =========================================================

  const handleLogin = async (e) => {

    e.preventDefault();


    try {
      setSubmitting(true);

      const response =
        await API.post(
          "auth/login/",
          form
        );


      console.log(
        "Login Response:",
        response.data
      );


      // =====================================
      // Save authentication
      // =====================================

      login(response.data);


      toast.success(
        "Login Successful"
      );


      // =====================================
      // Admin / User Redirect
      // =====================================

      if (
        response.data.is_staff ||
        response.data.is_superuser
      ) {

        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );

      } else {

        navigate(
          "/",
          {
            replace: true,
          }
        );

      }


    } catch (error) {

      console.error(
        "Login Error:",
        error
      );


      const message =
        error.response?.data?.message ||
        "Invalid username or password";


      toast.error(message);

    } finally {
      setSubmitting(false);
    }

  };


  return (

    <div className="login-container">


      <section className="login-card" aria-labelledby="login-title">
        <div className="auth-brand">
          <span className="auth-brand-icon"><FaNewspaper /></span>
          <div>
            <strong>Fake News Detector</strong>
            <span>AI-powered news verification</span>
          </div>
        </div>

        <div className="auth-heading">
          <h2 id="login-title">Welcome back</h2>
          <p>Sign in to continue analysing news stories.</p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off" noValidate={false}>
          <label className="auth-field-label" htmlFor="login-username">Username</label>
          <div className="auth-input-wrap">
            <FaUser aria-hidden="true" />
            <input
              id="login-username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
              readOnly
              onFocus={(event) => event.currentTarget.removeAttribute("readOnly")}
              required
            />
          </div>

          <label className="auth-field-label" htmlFor="login-password">Password</label>
          <div className="password-input-wrapper auth-input-wrap">
            <FaLock aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              readOnly
              onFocus={(event) => event.currentTarget.removeAttribute("readOnly")}
              required
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
            </button>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </section>


    </div>

  );

}


export default Login;