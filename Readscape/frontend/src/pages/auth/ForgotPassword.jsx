import { Link } from "react-router-dom";

import useForgotPasswordLogic from "./forgotPasswordLogic";
import "./auth.css";

function ForgotPassword() {
  const {
    email,
    submitted,
    handleEmailChange,
    handleSubmit,
    resetForm,
  } = useForgotPasswordLogic();

  return (
    <main className="auth-page">
      <section className="auth-form-section">
        <div className="auth-container">
          <Link to="/login" className="auth-logo">
            <span className="logo-box">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5.5C6.8 4.9 9.5 5.5 12 7.2V19c-2.5-1.7-5.2-2.3-8-1.7V5.5Z" />
                <path d="M20 5.5c-2.8-.6-5.5 0-8 1.7V19c2.5-1.7 5.2-2.3 8-1.7V5.5Z" />
              </svg>
            </span>
            <span>Readscape</span>
          </Link>

          {!submitted ? (
            <>
              <div className="auth-copy forgot-copy">
                <div className="eyebrow">
                  <span></span>
                  FIND YOUR WAY BACK
                </div>

                <h1>
                  Forgot your
                  <br />
                  password?
                </h1>

                <p>
                  Enter the email connected to your Readscape account and
                  we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form className="auth-form forgot-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="forgot-email">Email address</label>

                  <div className="input-wrapper">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>

                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="reader@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>
                </div>

                <button className="auth-submit" type="submit">
                  Send reset link
                  <span>→</span>
                </button>
              </form>

              <p className="auth-switch forgot-back">
                Remember your password? <Link to="/login">Back to login</Link>
              </p>
            </>
          ) : (
            <div className="reset-success">
              <div className="success-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                  <path d="m8.5 12.5 2 2 5-5" />
                </svg>
              </div>

              <div className="eyebrow success-eyebrow">
                <span></span>
                CHECK YOUR INBOX
              </div>

              <h1>Reset link sent</h1>

              <p>
                If an account exists for <strong>{email}</strong>, you&apos;ll
                receive password reset instructions shortly.
              </p>

              <Link className="auth-submit success-login-button" to="/login">
                Return to login
                <span>→</span>
              </Link>

              <button
                className="send-again-button"
                type="button"
                onClick={resetForm}
              >
                Use a different email
              </button>
            </div>
          )}

          <p className="privacy-copy">
            Your library stays private to your account.
          </p>
        </div>
      </section>

      <ForgotPasswordVisual />
    </main>
  );
}

function ForgotPasswordVisual() {
  return (
    <section className="auth-visual forgot-visual" aria-hidden="true">
      <div className="visual-noise"></div>
      <div className="ambient-glow glow-one"></div>
      <div className="ambient-glow glow-two"></div>

      <span className="spark spark-one">✦</span>
      <span className="spark spark-two">✧</span>

      <div className="forgot-scene">
        <div className="forgot-envelope">
          <div className="envelope-back"></div>
          <div className="envelope-letter">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="envelope-front"></div>
          <div className="envelope-seal">
            <svg viewBox="0 0 24 24">
              <path d="M12 4 14.2 9.1 20 10l-4.2 4 1 5.8L12 17l-4.8 2.8 1-5.8L4 10l5.8-.9L12 4Z" />
            </svg>
          </div>
        </div>

        <div className="forgot-book book-left"></div>
        <div className="forgot-book book-right"></div>

        <div className="forgot-candle">
          <div className="forgot-flame"></div>
          <div className="forgot-wick"></div>
          <div className="forgot-candle-body"></div>
          <div className="forgot-candle-halo"></div>
        </div>
      </div>

      <div className="visual-caption forgot-caption">
        <span className="caption-rule"></span>
        <p>Every reader finds their way back.</p>
      </div>
    </section>
  );
}

export default ForgotPassword;
