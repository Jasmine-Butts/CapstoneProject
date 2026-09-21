import { useState } from "react";

function useForgotPasswordLogic() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to send reset link.");
      }

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setEmail("");
    setError("");
  };

  return {
    email,
    submitted,
    loading,
    error,
    handleEmailChange,
    handleSubmit,
    resetForm,
  };
}

export default useForgotPasswordLogic;