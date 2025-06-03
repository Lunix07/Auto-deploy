// src/pages/OAuthSuccess.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const githubToken = params.get("github_token");

    if (accessToken && githubToken) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("github_token", githubToken);
      navigate("/dashboard"); // or any protected route
    } else {
      navigate("/login"); // fallback
    }
  }, []);

  return <div>Redirecting...</div>;
}

export default OAuthSuccess;
