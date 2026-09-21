import { Link } from "react-router-dom";
import { useState } from "react";

import "./auth.css";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend registration will be connected here
    console.log("Signup submitted");
  };

  return (
    <main className="auth-page">
      <section className="auth-form-section">
        <div className="auth-container">
          <Link to="/" className="auth-logo">
            <span className="logo-box">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5.5C6.8 4.9 9.5 5.5 12 7.2V19c-2.5-1.7-5.2-2.3-8-1.7V5.5Z" />
                <path d="M20 5.5c-2.8-.6-5.5 0-8 1.7V19c2.5-1.7 5.2-2.3 8-1.7V5.5Z" />
              </svg>
            </span>
            <span>Readscape</span>
          </Link>

          <div className="auth-copy signup-copy">
            <div className="eyebrow">
              <span></span>
              A LIBRARY OF YOUR OWN
            </div>

            <h1>Join Readscape</h1>

            <p>
              Create your account and begin a more thoughtful reading journey.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>

              <div className="input-wrapper">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c.8-5 3.5-7 8-7s7.2 2 8 7" />
                </svg>

                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <div className="input-wrapper">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="email"
                  type="email"
                  placeholder="reader@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />

                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm password</label>

              <div className="input-wrapper">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  minLength={8}
                  required
                />

                <button
                  className="password-toggle"
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit">
              Begin your journey
              <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
          
        </div>
      </section>

      <CozyReadingVisual caption="Make space for the stories ahead." />
    </main>
  );
}

function CozyReadingVisual({ caption }) {
  return (
    <section className="auth-visual" aria-hidden="true">
      <div className="visual-noise"></div>
      <div className="ambient-glow glow-one"></div>
      <div className="ambient-glow glow-two"></div>
      <div className="fireplace-glow"></div>

      <span className="spark spark-one">✦</span>
      <span className="spark spark-two">✧</span>

      <div className="reading-scene">
        <div className="leaf leaf-a"></div>
        <div className="leaf leaf-b"></div>

        <div className="book-stack">
          <div className="book book-top">
            <span className="book-line"></span>
          </div>
          <div className="book book-middle">
            <span className="book-line"></span>
          </div>
          <div className="book book-bottom">
            <span className="book-line"></span>
          </div>
        </div>

        <div className="candle">
          <div className="flame">
            <span></span>
          </div>
          <div className="wick"></div>
          <div className="candle-body">
            <div className="candle-highlight"></div>
          </div>
          <div className="candle-halo"></div>
        </div>

        <div className="mug">
          <div className="mug-body"></div>
          <div className="mug-handle"></div>
          <span className="steam steam-one"></span>
          <span className="steam steam-two"></span>
        </div>

        <div className="bookmark">
          <span></span>
        </div>

        <div className="scene-shadow"></div>
      </div>

      <div className="visual-caption">
        <span className="caption-rule"></span>
        <p>{caption}</p>
      </div>
    </section>
  );
}

export default Signup;
