import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter Username & Password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        alert("✅ Login Successful");

        // Admin & Stock Manager banne Dashboard par jashe
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid Username or Password");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server Connection Error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img
          src="/stellan-logo.png"
          alt="Stellan Logo"
          className="logo"
        />

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">
          STELLAN ERP (Enterprise Resource Planning)
        </p>

        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-btn"
          onClick={handleLogin}
        >
          LOGIN
        </button>

        <p className="login-footer">
          © {new Date().getFullYear()} STELLAN Tech Innovations Pvt Ltd
        </p>
      </div>
    </div>
  );
};

export default Login;