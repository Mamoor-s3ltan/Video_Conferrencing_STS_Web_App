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
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-[#1E1E1E] text-white px-4">
      {/* Left Side - Welcome Text */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center md:text-left px-6 md:px-12">
        <div className="bg-[#2B2B2B] w-28 h-28 rounded-full flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gray-600 rounded-full" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-snug text-indigo-400">
          Welcome to VideoMeet
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Connect effortlessly with high-quality video meetings anytime, anywhere.
        </p>
      </div>

      {/* Right Side - Login Card */}
      <div className="w-full md:w-[400px] bg-[#2B2B2B] p-8 rounded-3xl shadow-xl border border-gray-700 flex flex-col items-center mt-10 md:mt-0">
        <h2 className="text-2xl font-bold mb-6 text-indigo-400">LOGIN</h2>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            type="text"
            placeholder="Email or Username"
            className="w-full mb-4 p-3 bg-[#1E1E1E] border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 bg-[#1E1E1E] border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? "Signing In..." : "LOGIN"}
          </button>
        </form>

        <div className="text-center my-4 text-sm text-gray-400">OR</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white text-black w-full py-3 rounded-lg hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-xs mt-6 text-gray-400">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-indigo-400 font-semibold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signin;
