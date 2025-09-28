import { useState } from "react";
import { useNavigate } from "react-router-dom";
import registerUser from "../api/Register";

function RegisterPage() {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");    // string for API errors
  const [success, setSuccess] = useState(""); // string for success message
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = await registerUser(inputs); // { message: "User has been created." }
      const msg = data?.message || "Registration successful";
      setSuccess(msg);

      // clear the form after success
      setInputs({ username: "", email: "", password: "", name: "" });

      // Option A: redirect after showing the message briefly
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { flash: msg }, // pass a flash message to the login page if you want
        });
      }, 900);

      // Option B (immediate): navigate("/login", { replace: true, state: { flash: msg } });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong";
      setError(msg);
    }
  };

  return (
    <div className="container flex flex-col gap-2 mx-auto bg-gray-200 p-4">
      {error && (
        <p className="bg-red-100 text-red-800 border border-red-500 text-center p-2">
          {error}
        </p>
      )}
      {success && (
        <p className="bg-green-100 text-green-800 border border-green-500 text-center p-2">
          {success}
        </p>
      )}

      <form onSubmit={handleClick} className="flex flex-col gap-2">
         <input
          type="text"
          placeholder="name"
          name="name"
          value={inputs.name}
          onChange={handleChange}
          required
          className="p-2 border"
        />
        <input
          type="text"
          placeholder="username"
          name="username"
          value={inputs.username}
          onChange={handleChange}
          required
          className="p-2 border"
        />
        <input
          type="email"
          placeholder="email"
          name="email"
          value={inputs.email}
          onChange={handleChange}
          required
          className="p-2 border"
        />
        <input
          type="password"
          placeholder="password"
          name="password"
          value={inputs.password}
          onChange={handleChange}
          required
          className="p-2 border"
        />
        <button type="submit" className="p-2 border bg-white">
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
