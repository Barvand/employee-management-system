// /src/pages/Login.jsx
import { useState } from "react";
import { Account } from "appwrite";
import { useNavigate } from "react-router-dom";
import { client } from "../lib/appwrite";
import LoginForm from "../components/login/login";
const account = new Account(client);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      // Navigate to Employee Dashboard - Navigate to Admin dashboard - Navigate to Regnskap - Depend on the role of the user
      await account.createEmailPasswordSession(email, password);
      const user = await account.get(); // fetch user data with prefs
      if (user.prefs.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.prefs.role === "employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      email={email}
      setEmail={setEmail}
      password={password}
      error={error}
      setPassword={setPassword}
    />
  );
};

export default Login;
