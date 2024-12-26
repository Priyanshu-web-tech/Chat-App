import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // Import to check if the user is logged in

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
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

  const handleSignup = async () => {
    setLoading(true); // Set loading to true
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
      });

      navigate("/chat");
    } catch (error) {
      console.error(error.message);
      alert("Failed to sign up. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after completion
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  const goToLogin = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Create an Account</h1>
      <div className="w-80">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-800 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyPress}
        />
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
          onClick={handleSignup}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-2"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <button
          onClick={goToLogin}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
