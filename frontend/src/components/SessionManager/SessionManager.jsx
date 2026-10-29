import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 60 * 1000;
const LAST_ACTIVITY_KEY = "session_last_activity";
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"];

function getSessionTimeout() {
  const configuredMinutes = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES);
  return Number.isFinite(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes * 60 * 1000
    : DEFAULT_TIMEOUT_MS;
}

function SessionManager() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const warningShownRef = useRef(false);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      return undefined;
    }

    const timeoutMs = getSessionTimeout();

    const clearTimers = () => {
      window.clearTimeout(timeoutRef.current);
      window.clearTimeout(warningRef.current);
    };

    const endSession = () => {
      clearTimers();
      warningShownRef.current = false;
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      logout();
      toast.info("Your session expired due to inactivity. Please log in again.");
      navigate("/login", { replace: true });
    };

    const scheduleLogout = () => {
      clearTimers();

      const elapsed = Date.now() - Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
      const remaining = timeoutMs - elapsed;

      if (remaining <= 0) {
        endSession();
        return;
      }

      const warningDelay = Math.max(0, remaining - Math.min(WARNING_MS, timeoutMs / 4));
      warningShownRef.current = false;

      warningRef.current = window.setTimeout(() => {
        warningShownRef.current = true;
        toast.warning("Your session will expire in 1 minute due to inactivity.", {
          toastId: "session-expiring",
          autoClose: WARNING_MS,
        });
      }, warningDelay);

      timeoutRef.current = window.setTimeout(endSession, remaining);
    };

    const recordActivity = () => {
      toast.dismiss("session-expiring");
      warningShownRef.current = false;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      scheduleLogout();
    };

    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });
    window.addEventListener("storage", scheduleLogout);

    scheduleLogout();

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
      window.removeEventListener("storage", scheduleLogout);
    };
  }, [isAuthenticated, logout, navigate]);

  return null;
}

export default SessionManager;
