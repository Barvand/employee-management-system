import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import LoginForm from "../components/login/login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login({ email, password });
      console.log(user);
      if (user.role === "admin") navigate("/admin-dashboard");
      else if (user.role === "accountant") navigate("/accountant-dashboard");
      else navigate("/employee-dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(msg);
    }
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
    />
  );
}
