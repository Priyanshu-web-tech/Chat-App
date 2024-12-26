import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to chat if already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/chat");
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/chat"); // Redirect to chat page
    } catch (error) {
      console.error(error.message);
      alert("Failed to login. Please check your credentials.");
    } finally {
      setLoading(false); // Stop loading when done
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome to Chat App</h1>
      <div className="w-80">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-800 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-800 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
          disabled={loading} // Disable button when loading
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <button
          onClick={goToSignup}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
