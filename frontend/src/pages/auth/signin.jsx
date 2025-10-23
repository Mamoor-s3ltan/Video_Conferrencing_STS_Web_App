import React, { useState } from "react";
import { supabase } from "../../conn.js";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = formData;

    if (!identifier || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      if (error) throw error;

      alert("Signed in successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gradient-to-br from-[#6A1B9A] to-[#8E24AA] text-white px-4">
      {/* Left Side - Welcome Text */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center md:text-left px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">
          Welcome to Video<br />Conferencing Platform
        </h1>
      </div>

      {/* Right Side - Login Card */}
      <div className="w-full md:w-[400px] bg-[#9D38C9FF] p-8 rounded-3xl shadow-xl flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">LOGIN</h2>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            type="text"
            placeholder="Email or Username"
            className="w-full mb-4 p-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6A1B9A] hover:bg-[#4A0072] text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? "Signing In..." : "LOGIN"}
          </button>
        </form>

        <div className="text-center my-4 text-sm">OR</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white text-[#6A1B9A] w-full py-3 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-xs mt-6 text-gray-200">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-white font-semibold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signin;
