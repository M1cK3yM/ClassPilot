import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const decodeJWT = (token) => {
    try {
      // JWT tokens are in format: header.payload.signature
      const decoded = jwtDecode(token);
      const userId = decoded.sub;
      const username = decoded.username;
      const role = decoded.role;

      return {
        userId,
        username,
        role,
      };
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // switch (username) {
    //   case "teacher":
    //     login(username, "TEACHER");
    //     navigate("/teacher");
    //     break;
    //   case "student":
    //     login(username, "STUDENT");
    //     navigate("/student");
    //     break;
    //   default:
    //     break;
    // }
    // return;
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok && data.accessToken && data.refreshToken) {
        // Store both tokens in localStorage for future authenticated requests
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Decode the JWT to get the role
        const decodedToken = decodeJWT(data.accessToken);
        console.log("Decoded token:", decodedToken);

        if (
          decodedToken &&
          decodedToken.userId &&
          decodedToken.username &&
          decodedToken.role
        ) {
          const { userId, username, role } = decodedToken;
          console.log("Extracted role:", role);

          login(userId, username, role);

          switch (role) {
            case "TEACHER":
              navigate("/teacher");
              break;
            case "STUDENT":
              navigate("/student");
              break;
            case "ADMIN":
              navigate("/admin");
              break;
            default:
              setError("Invalid user role");
              logout();
          }
        } else {
          setError("Could not extract user role from token");
          logout();
        }
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-800">
      <div className="w-full max-w-md p-8 mx-4 bg-white rounded-2xl shadow-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Sign in to ClassPilot
          </h2>
          <p className="text-gray-600 text-sm">
            Hey, welcome back to your special place
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={loading}
              >
                <span className="material-icons">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                disabled={loading}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
              <span className="material-icons mr-2 text-red-500">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-3 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
