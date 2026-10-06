import { Eye, EyeOff, Lock, Mail, ShieldCheck, Store, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../lib/api";

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const REMEMBER_EMAIL_KEY = "suadmin.rememberedEmail";

function readRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function LoginPage() {
  const { isSignedIn, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const rememberedEmail = readRememberedEmail();
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(rememberedEmail.length > 0);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSignedIn) return <Navigate to={from} replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    let valid = true;

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!valid) return;

    setSubmitting(true);
    setError(null);
    try {
      await signIn(trimmedEmail, password);
      if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <span className="brand-mark">
              <ShieldCheck size={22} />
            </span>
            <div>
              <div className="login-logo-title">Flint &amp; Thread</div>
              <div className="login-logo-subtitle">Super Admin</div>
            </div>
          </div>

          <h2>Run the platform from one place</h2>
          <p>Create admins, review sellers, and keep every store on Flint &amp; Thread in order.</p>

          <ul className="login-points">
            <li>
              <Users size={18} />
              <span>Manage admin accounts and roles</span>
            </li>
            <li>
              <Store size={18} />
              <span>Review seller status and details</span>
            </li>
            <li>
              <ShieldCheck size={18} />
              <span>Signed-in access for super admins only</span>
            </li>
          </ul>
        </div>
      </aside>

      <main className="login-panel">
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-form-header">
            <h1>Super Admin Login</h1>
            <p className="muted">Enter your email and password to open the admin panel.</p>
          </div>

          {error ? (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
            </div>
          ) : null}

          <label className="field">
            <span className="field-label">Email</span>
            <div className={`login-input${emailError ? " is-error" : ""}${emailFocused ? " is-focused" : ""}`}>
              <Mail size={18} />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                  if (error) setError(null);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="Enter your email"
                autoFocus
              />
            </div>
            {emailError ? <span className="login-field-error">{emailError}</span> : null}
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className={`login-input${passwordError ? " is-error" : ""}${passwordFocused ? " is-focused" : ""}`}>
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                  if (error) setError(null);
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError ? <span className="login-field-error">{passwordError}</span> : null}
          </label>

          <label className="login-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <button type="submit" className="btn btn-primary btn-block login-submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="login-footer">© {new Date().getFullYear()} Flint &amp; Thread. All rights reserved.</p>
      </main>
    </div>
  );
}
